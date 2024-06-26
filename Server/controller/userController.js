const express = require("express");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');


//Profile Route
const updateprofile = async (req, res) => {
  const { _id } = req.user;
  try {
    // Use findByIdAndUpdate to update user's information
    const user = await User.findByIdAndUpdate(_id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ error: "No such user" });
    }
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getprofile = async (req, res) => {
  const { email, firstName, lastName, birthday, currentjob, website, twitter, facebook, linkedin, interests, introduction } = req.user;
  res.status(200).json({ email, firstName, lastName, birthday, currentjob, website, twitter, facebook, linkedin, interests, introduction });
};

const changepassword = async (req, res) => {
  try {
    const { password } = req.user; // Assuming this is the hashed password
    const { oldPassword, newPassword } = req.body;

    // Check if old password is correct
    const isMatch = await bcrypt.compare(oldPassword, password);
    if (!isMatch) {
      return res.status(400).json({ error: "Old password is incorrect" });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update the user's password
    req.user.password = hashedPassword;
    await req.user.save(); // Corrected case sensitivity

    res.status(200).json({ success: 'Password changed successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getUserById = async (req,res) =>{
  try{
      const userId = req.params.id;
      const user = await User.findById(userId);
      if(!user){
          req.status(404).json({message:"User not found"});
      }
      res.status(200).json(user);
  }catch(error){
      res.status(500).json({error: error.message});
  }
}

const getPurchasedCourses = async (req, res) => {
  try {
      const userWithPurchasedCourses = await req.user.populate([{
              path: 'joinedCourses.courseId', 
              model: 'Course' 
          },
          {
              path: 'joinedCourses.currentLesson', 
              model: 'Lesson' 
          },
          {
              path: 'joinedCourses.completedLessons', 
              model: 'Lesson' 
          },
      ]);

      if (userWithPurchasedCourses.joinedCourses && userWithPurchasedCourses.joinedCourses.length > 0) {
          const filteredCourses = userWithPurchasedCourses.joinedCourses.filter(joinedCourse => 
              joinedCourse.courseId && joinedCourse.courseId.status !== 'banned'
          );

          for (let joinedCourse of filteredCourses) {
              if (joinedCourse.courseId) { // Ensuring that courseId exists
                  joinedCourse.courseId = await joinedCourse.courseId.populate({
                      path: 'author',
                      model: 'User'
                  });
              }
          }

          res.status(200).json({ purchasedCourses: filteredCourses });
      } else {
          res.status(200).json({ purchasedCourses: [] });
      }
  } catch (error) {
      console.error('Error searching courses:', error);
      res.status(500).json({
          message: error.message,
          error: error.name
      });
  }
}

module.exports = { getprofile, updateprofile, changepassword, getUserById, getPurchasedCourses };

