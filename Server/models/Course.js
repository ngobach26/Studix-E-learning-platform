const mongoose = require("mongoose");
const { Schema } = mongoose;
const Section = require("./Section");

const courseSchema = Schema(
    {
        courseTitle: {
            type: String,
            required: true,
            unique: true
        },
        description: {
            type: String,
        },
        status: {
            type: String,
            enum: ['waiting_ac', 'published', 'banned', 'waiting_del', 'updated'],
        },
        category: {
            type: String,
            required: true
        },
        subcategory: [
            {
                type: String
            }
        ],
        language: {
            type: String,
        },
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Expert', 'All Levels'],
            default: "All Levels"
        },
        price: {
            type: Number,
            default: 0,
            min: [0, 'Price must be greater than or equal to 0']
        },
        contents: [Section.schema],
        ratingPoints: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        numRatings: {
            type: Number,
            default: 0,
        },
        studentsEnrolled: [
            {
                type: Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        objectives: {
            type: String,
        },
        coverImage: {
            type: String,
        },
        demoVideo: {
            type: String,
        },
        duration: {
            type: Number,
            min: 0,
            default: 0,
        },
        outcomes: [
            {
                type: String
            }
        ],
        prerequisites: [
            {
                type: String
            }
        ],
        target_audience: [
            {
                type: String
            }
        ],
        author: {
            type: Schema.Types.ObjectId,
            ref: "User"
        }
    },
    { timestamps: true }
);

courseSchema.index({ courseTitle: "text", description: "text" });

module.exports = mongoose.model("Course", courseSchema);