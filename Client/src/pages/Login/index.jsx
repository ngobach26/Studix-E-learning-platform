import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; 

import { useLogin } from "../../hooks/useLogin";
import Button from "../../components/Button";

import LoadingButton from '@mui/lab/LoadingButton';
import { Checkbox, FormControlLabel, TextField, Snackbar, Avatar, CircularProgress } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import WarningIcon from "@mui/icons-material/Warning";


function Copyright(props) {
  return (
    <p className="text-sm text-center text-gray-500" {...props}>
      {"Copyright © "}
      <a href="#" className="text-blue-500">
        CornHub
      </a>{" "}
      {new Date().getFullYear()} {"."}
    </p>
  );
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorAlert, setErrorAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const login = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { role } = await login(email, password);
      if (role==="admin") 
        navigate("/admin");
      else navigate("/");
    } catch (err) {
      setErrorAlert(err.response.data.error);
    }
  };

  const handleAlertClose = () => {
    setErrorAlert(null);
  };

  return (
    <div className="flex flex-col h-screen px-6 py-6 md:flex-row">
      <div
        className="flex flex-1 px-10 bg-center bg-cover md:bg-contain "
        style={{
          backgroundImage:
            "url(https://img.freepik.com/premium-vector/boy-studying-with-computer-and-books-vector-illustration-concept-in-cartoon-style_113065-1082.jpg)",
          backgroundRepeat: "no-repeat",
        }}
      />
      <div className="flex flex-1 items-center justify-center rounded-[15px] shadow-[rgba(0,_0,_0,_0.3)_0px_20px_60px]">
        <div className="w-4/5 max-w-md">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <Avatar sx={{  bgcolor: "#0077FF" }}>
                <LockOutlinedIcon />
              </Avatar>
            </div>
            <h1 className="mt-4 text-2xl font-semibold">Log in</h1>
          </div>
          <Snackbar
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            open={!!errorAlert}
            autoHideDuration={5000}
            onClose={handleAlertClose}
            message={
              <div className="flex items-center">
                <WarningIcon color="error" style={{ marginRight: "8px" }} />
                <span>
                  {errorAlert}
                </span>
              </div>
            }
          />
          <form className="mt-8" onSubmit={handleSubmit}>
            <div>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center mb-4">
              <FormControlLabel
                control={<Checkbox value="remember" color="primary" />}
                label="Remember me"
              />
              <div className="flex items-end justify-end flex-1">
                <Link
                  to="/notfound"
                  className="text-base font-semibold text-blue-500"
                >
                  Forgot password?
                </Link>
              </div>
            </div>
            <Button label="Log In" type="submit" className="mt-5" />
            <div className="mt-4 text-center">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-base font-semibold text-blue-500"
              >
                Sign up
              </Link>
            </div>
          </form>
          <Copyright className="mt-5" />
        </div>
      </div>
    </div>
  );
}