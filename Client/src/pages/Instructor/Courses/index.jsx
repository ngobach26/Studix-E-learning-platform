import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import AddIcon from "@mui/icons-material/Add";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import { Snackbar } from "@mui/material";
import WarningIcon from "@mui/icons-material/Warning";
import Checkbox from "@mui/material/Checkbox";
import RemoveIcon from "@mui/icons-material/Remove";
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

import { useAuthContext } from "../../../hooks/useAuthContext";
import Button from "../../../components/Button";
import CourseCard from "../../../components/CourseCard";

import api from "../../../services/instructorAPI";

export default function Courses() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [courseTitle, setcourseTitle] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCourses, setActiveCourses] = useState([]);
  const [deletedCourses, setDeletedCourses] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const categories = ["Information Technology", "Business", "Finance and accouting", "Editing and design", "Music", "Fitness", "Self development"]

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleCheckboxChange = (course) => {
    setSelectedCourse((prevSelectedCourse) =>
      prevSelectedCourse && prevSelectedCourse._id === course._id
        ? null
        : course
    );
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setError("");
    setcourseTitle("");
    setCategory("");
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleCreateCourse = async () => {
      if (!courseTitle && !category) {
        setError("Please fill in the Title and Category.");
      } else if (!courseTitle) {
        setError("Please fill in the Title");
      } else if (courseTitle.length < 3 || courseTitle.length > 100) {
        setError("Title must be between 3 and 100 characters.");
      } else if (!category) {
        setError("Please fill in the Category.");
      } else {
        try {
          const newCourse = { courseTitle, category };
          const createdCourse = await api.createCourse(user.token, newCourse);
          setActiveCourses([...activeCourses, createdCourse]);
          handleCloseDialog();
        } catch (err) {
          setError(err.response.data.message);
        }        
      }
  };

  useEffect(() => {
    const fetchPublishedCourses = async () => {
      try {
        const courses = await api.getPublishedCourse(user.token);
        setActiveCourses(courses.filter((course)=>course.status != 'waiting_del'))
        setDeletedCourses(courses.filter((course)=>course.status == 'waiting_del'))
      } catch (error) {
        console.error("Error fetching published courses:", error);
      }
    };

    fetchPublishedCourses();
  }, []);

  const handleDeleteCourse = async () => {
    try {
      if (selectedCourse) {
        if (selectedCourse.status === "waiting_del") {
          setSnackbarMessage("This course is already marked for deletion.");
          setSnackbarOpen(true);
        } else {
          await api.deleteCourse(user.token, selectedCourse._id);
          setSnackbarMessage(
            "Course has been marked for deletion successfully. The request will be reviewed!"
          );
          setSnackbarOpen(true);
          setActiveCourses(activeCourses.filter(course => course._id !== selectedCourse._id));
          setDeletedCourses([...deletedCourses, selectedCourse]);
        }
      }
    } catch (error) {
      console.error("Error marking deleted course:", error);
      setSnackbarMessage(error.message);
      setSnackbarOpen(true);
    }
  };

  const handleCourseClick = (course) => {
    if (course.status === "waiting_del") {
      setSnackbarMessage("This course is marked for deletion and cannot be edited.");
      setSnackbarOpen(true);
    } else {
      navigate(`/instructor/courses/manage/course-detail/${course._id}`);
    }
  };

  const handleDeletedCourseClick = () => {
      setSnackbarMessage("This course is already marked for deletion.");
      setSnackbarOpen(true);
  }

  const renderActiveCourses = () => {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-1">
        {activeCourses.map((course) => (
          <div key={course._id}>
            <CourseCard
              course={course}
              handleClick={() => handleCourseClick(course)}
              hoverText="Edit / Manage course"
              showHoverOpacity={true}
            />
            <Checkbox
              checked={selectedCourse && selectedCourse._id === course._id}
              onChange={() => handleCheckboxChange(course)}
              color="primary"
              inputProps={{ "aria-label": "primary checkbox" }}
            />
          </div>
        ))}
      </div>
    );
  };
  const renderDeletedCourses = () => {
    return (
      <div className="py-4 text-left">
        <h2 className="flex items-center mb-2 text-xl font-medium">
          <WarningIcon sx={{ marginRight: 1 }} /> Courses Marked for Deletion:
        </h2>
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 sm:gap-1">
          {deletedCourses.map((course) => (
            <div key={course._id}>
              <CourseCard
                course={course}
                showHoverOpacity={false}
                handleClick={() => handleDeletedCourseClick()}
              />
            </div>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-between mb-5">
        <h1 className="text-2xl font-medium">Courses</h1>
        <div className="flex space-x-4">
          <Button
            label="Create"
            startIcon={<AddIcon />}
            onClick={handleOpenDialog}
          />
          <Button
            label="Remove"
            startIcon={<RemoveIcon />}
            onClick={handleDeleteCourse}
          />
        </div>
      </div>
      <Dialog fullWidth={true} open={isDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>
          <div className="flex flex-col text-2xl font-medium">
            Create a new course
          </div>
        </DialogTitle>
        <form>
          <DialogContent>
            <TextField
              label="Title"
              required
              fullWidth
              value={courseTitle}
              onChange={(e) => setcourseTitle(e.target.value)}
              margin="normal"
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
            </FormControl>
            <DialogActions>
              <Button
                label="Cancel"
                variant="outlined"
                onClick={handleCloseDialog}
              />
              <Button label="Create" onClick={handleCreateCourse} />
            </DialogActions>
          </DialogContent>
        </form>
        {error && (
          <Alert severity="error">
            <AlertTitle>Error</AlertTitle>
            <div>{error}</div>
          </Alert>
        )}
      </Dialog>
      {renderActiveCourses()}
      {renderDeletedCourses()}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </>
  );
}