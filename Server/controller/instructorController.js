const Course = require("../models/course");
const Section = require("../models/Section");
const Lesson = require("../models/Lesson");
const validFields = ['courseTitle', 'description', 'price', 'level', 'language', 'category', 'subcategory', 'objectives', 'contents','totalLengthSeconds', 'status', 'outcomes', 'prerequisites', 'target_audience', 'demoVideo'];

const createCourse = async (req, res) => {
    try {
        const existingCourse = await Course.findOne({ courseTitle: req.body.courseTitle });

        if (existingCourse) {
            return res.status(409).json({ message: "Course name existed"});
        }

        // Define a list of fields that can be set by the user

        // Create a new course object with only the allowed fields
        let courseData = {};
        validFields.forEach(field => {
            if (req.body[field] !== undefined) {
                courseData[field] = req.body[field];
            }
        });
        courseData.author = req.user._id;

        // Set the status to "waiting_ac"
        courseData.status = "waiting_ac";

        const course = new Course(courseData);
        const newCourse = await course.save();

        // Add the new course's ID to the user's publishedCourse array
        req.user.publishedCourse.push(newCourse._id);
        await req.user.save();

        res.status(201).json(newCourse);
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({
            message: error.message,
            error: error.name
        });
    }
};


const getPublishedCourse = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Populate the publishedCourse array with Course data and select only basic fields
        const userWithCourses = await req.user.populate({
            path: 'publishedCourse',
            model: 'Course',
            select: '_id courseTitle description status category level ratingPoints numRatings coverImage duration' // Adjust the fields as per your requirements
        });

        // Check if user has published courses
        // if (!userWithCourses.publishedCourse.length) {
        //     return res.status(404).json({ message: "No published courses found" });
        // }

        // Send the populated data as response
        res.status(200).json(userWithCourses.publishedCourse);
    } catch (error) {
        console.error('Error getting course:', error);
        res.status(500).json({
            message: error.message,
            error: error.name
        });
    }
};


const deleteCourse = async (req, res) => {
    try {
        const courseID = req.params.id;

        // Check if the course is published by the user
        const isCoursePublishedByUser = req.user.publishedCourse.some(course => course.equals(courseID));
        if (!isCoursePublishedByUser) {
            return res.status(403).json({ message: "Unauthorized to delete this course" });
        }

        // Find the course and check its current status
        const course = await Course.findById(courseID);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        if (course.status === 'waiting_del') {
            return res.status(400).json({ message: "Course is already marked for deletion" });
        }

        // Update the course status to 'waiting_del'
        course.status = 'waiting_del';
        await course.save();

        res.status(200).json({ message: "Course marked for deletion", courseTitle: course.courseTitle });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            message: error.message,
            error: error.name
        });
    }
};

const updateWithImage = async (req, res) => {
    try {
        console.log(req.file);
        console.log(req.body);
        
        const courseID = req.params.id;
        const course = await Course.findById(courseID);
        const updates = req.body;
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        if (course.status == "banned" || course.status == "waiting_del") {
            return res.status(403).json({ message: "Course is banned or waiting delete" });
        }

        // Check if the course is published by the user
        const isCoursePublishedByUser = req.user.publishedCourse.some(course => course.equals(courseID));
        if (!isCoursePublishedByUser) {
            return res.status(403).json({ message: "Unauthorized to update this course" });
        }

        // Handle top-level course field updates
        if (updates) {
            Object.keys(updates).forEach(key => {
                if (validFields.includes(key) && updates[key] !== undefined) {
                    course[key] = updates[key];
                }
            });
        }

        if (req.file){
            course.coverImage = req.file.filename;
        }

        if(course.status !== 'waiting_ac'){
            course.status = 'updated';
        }
        await course.save();
        res.status(200).json({ message: "Course updated successfully", course });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            message: error.message,
            error: error.name
        });
    }
}

const updateCourse = async (req, res) => {
    try {
        const courseID = req.params.id;
        const updates = req.body;
    
        // Fetch the course to be updated
        const course = await Course.findById(courseID);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }
        if (course.status == "banned" || course.status == "waiting_del") {
            return res.status(403).json({ message: "Course is banned or waiting delete" });
        }

        // Check if the course is published by the user
        const isCoursePublishedByUser = req.user.publishedCourse.some(course => course.equals(courseID));
        if (!isCoursePublishedByUser) {
            return res.status(403).json({ message: "Unauthorized to update this course" });
        }

        // Handle top-level course field updates
        if (updates) {
            Object.keys(updates).forEach(key => {
                if (validFields.includes(key) && updates[key] !== undefined) {
                    course[key] = updates[key];
                }
            });
        }

        // Handle updates and additions to contents (sections and lessons)
        if (updates && updates.contents) {
            updates.contents.forEach(updateSection => {
                let section = course.contents.id(updateSection._id);
                if (section) {
                    // Update existing section
                    Object.keys(updateSection).forEach(key => {
                        if (key !== 'content' && updateSection[key] !== undefined) {
                            section[key] = updateSection[key];
                        }
                    });

                    // Update lessons within the section
                    if (updateSection.content) {
                        updateSection.content.forEach(updateLesson => {
                            let lesson = section.content.id(updateLesson._id);
                            if (lesson) {
                                // Update existing lesson
                                Object.keys(updateLesson).forEach(lessonKey => {
                                    if (updateLesson[lessonKey] !== undefined) {
                                        lesson[lessonKey] = updateLesson[lessonKey];
                                    }
                                });
                            }
                        });
                    }
                }
            });
        }

        // Save the updated course
        if(course.status !== 'waiting_ac'){
            course.status = 'updated';
        }

        // Mark the contents array as modified
        course.markModified('contents');
        await course.save();
        res.status(200).json({ message: "Course updated successfully", course });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({
            message: error.message,
            error: error.name
        });
    }
};

const getCourseById = async (req, res) => {
    try {
        const courseId = req.params.id; // Assuming the ID is passed as a URL parameter

        // Fetch the course from the database
        const course = await Course.findById(courseId).populate({
            path: 'author',
            select: 'firstName lastName'
        });;

        // Check if the course was found
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Return the course data
        res.status(200).json(course);
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({
            message: "An error occurred while retrieving the course",
            error: error.message
        });
    }
};

module.exports = { createCourse, getPublishedCourse, deleteCourse, updateWithImage, updateCourse, getCourseById };