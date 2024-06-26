import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import { TextField, Snackbar } from "@mui/material";
import Button from "../../Button";
import api from "../../../services/instructorAPI";
import { useAuthContext } from "../../../hooks/useAuthContext";

const Pricing = () => {
  const { user } = useAuthContext();
  const { id } = useParams();
  const [pricing, setPricing] = useState("Free");
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [price, setPrice] = useState(0);
  const [lastPrice, setLastPrice] = useState(0);

  const handlePricingChange = (event) => {
    setPricing(event.target.value);
    if (event.target.value === "Free") {
      setPrice(0);
    } else {
      setPrice(lastPrice);
    }
  };

  const handleInputChange = (price) => {
    setPrice(price);
    if (price>0) setLastPrice(price);
  };
  
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  useEffect(() => {
    const fetchPricingDetails = async () => {
      try {
        const course = await api.getCourseById(user.token, id);
        setPrice(course.price || 0 );
        setLastPrice(course.price || 0);
      } catch (error) {
        console.error("Error fetching pricing details:", error);
      }
    };

    fetchPricingDetails();
  }, [id, user.token]);

  const updateCoursePrice = async () => {
    try {
      await api.updateCourse(user.token, id, {price});
      setSnackbarMessage("Course price updated successfully!");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error updating course price:", error);
      setSnackbarMessage("Failed to update course price");
      setSnackbarOpen(true);
    }
  };

  const renderForm = () => {
    return (
      <div className="flex flex-col gap-5">
        <div className="flex items-start">
          <p className="mr-4">
            How do you intend to offer your course? Select the monetization
            option.
          </p>
        </div>
        <RadioGroup
          row
          value={pricing}
          onChange={handlePricingChange}
          name="pricing"
        >
          <FormControlLabel value="Free" control={<Radio />} label="Free" />
          <FormControlLabel value="Paid" control={<Radio />} label="Paid" />
        </RadioGroup>
        {pricing === "Paid" && (
          <TextField
            label="Price (in $)"
            type="number"
            inputProps={{
              min: 0, // Set the minimum value here
            }}
            value={price}
            onChange={(e) => handleInputChange(e.target.value)}
            fullWidth
            variant="outlined"
            className="mt-3"
          />
        )}
      </div>
    );
  };

  return (
    <>
      <div className="flex justify-between p-6 pt-0 mb-8 border-b border-labelText">
        <h1 className="text-2xl font-bold">Pricing</h1>
        <Button label="Save" type="submit" onClick={updateCoursePrice}/>
      </div>
      {renderForm()}
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </>
  );
};

export default Pricing;