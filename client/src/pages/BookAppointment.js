import React, { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useDispatch, useSelector } from "react-redux";
import { hideLoading, showLoading } from "../redux/alertsSlice";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";
import { Button, Col, DatePicker, Row, TimePicker } from "antd";

export default function BookAppointment() {
  const [doctor, setDoctor] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [date, setDate] = useState(moment());
  const [time, setTime] = useState();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const params = useParams();
  const { user } = useSelector((state) => state.user);

  const checkAvailability = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/user/check-booking-availability",
        {
          doctorId: params.doctorId,
          date: date,
          time: time,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      dispatch(hideLoading());

      if (response.data.success) {
        toast.success(response.data.message);
        setIsAvailable(true);
      } else {
        toast.error(response.data.message);
        setIsAvailable(false);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Something went wrong");
      setIsAvailable(false);
    }
  };

  const bookNow = async () => {
    setIsAvailable(false);
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/user/book-appointment",
        {
          doctorId: params.doctorId,
          userId: user._id,
          doctorInfo: doctor,
          userInfo: user,
          date: date,
          time: time,
        },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      dispatch(hideLoading());

      if (response.data.success) {
        setTime();
        setDate();
        toast.success(response.data.message);
      }
    } catch (error) {
      dispatch(hideLoading());
      toast.error("Something went wrong");
    }
  };

  const getDoctorData = async () => {
    try {
      dispatch(showLoading());
      const response = await axios.post(
        "/api/doctor/get-doctor-info-by-id",
        { doctorId: params.doctorId },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );
      dispatch(hideLoading());

      if (response.data.success) {
        setDoctor(response.data.data);
      } else {
        localStorage.clear();
        navigate("/login");
      }
    } catch (error) {
      dispatch(hideLoading());
      localStorage.clear();
      navigate("/login");
    }
  };

  useEffect(() => {
    getDoctorData();
  }, []);

  return (
    <div>
      <Layout>
        {doctor && (
          <div>
            <h1 className="page-title">
              {doctor.firstName} {doctor.lastName}
            </h1>
            <hr />

            <Row gutter={20} align="center" justify="center">
              <Col span={8} sm={24} xs={24} lg={8}>
                <img
                  src="https://media.istockphoto.com/vectors/hand-hold-phone-with-online-book-of-hotel-booking-of-hotel-ticket-and-vector-id1372148093?k=20&m=1372148093&s=612x612&w=0&h=E5eXEko_9Tyhyr4GOCSdPOm4exdwaxCNqDi1ySatwz0="
                  width="100%"
                  height="400"
                  alt="true"
                />
              </Col>

              <Col span={8} sm={24} xs={24} lg={8}>
                <div className="d-flex flex-column pt-2">
                  <h1 className="normal-text">
                    <b>Timings: </b> {doctor.timings[0]} - {doctor.timings[1]}
                  </h1>

                  <p>
                    <b>Phone Number: </b>
                    {doctor.phoneNumber}
                  </p>
                  <p>
                    <b>Address: </b>
                    {doctor.address}
                  </p>
                  <p>
                    <b>Fee per Visit: </b>
                    {doctor.feePerConsultation}
                  </p>
                  <p>
                    <b>Website: </b>
                    {doctor.website}
                  </p>

                  <DatePicker
                    format="DD-MM-YYYY"
                    data={date}
                    onChange={(value) => {
                      setIsAvailable(false);
                      setDate(moment(value).format("DD-MM-YYYY"));
                    }}
                  />

                  <TimePicker
                    format="HH:mm"
                    data={time}
                    className="mt-3"
                    onChange={(value) => {
                      setIsAvailable(false);
                      setTime(moment(value).format("HH:mm"));
                    }}
                  />

                  {!isAvailable && (
                    <Button
                      className="primary-button mt-3 full-width-button"
                      onClick={checkAvailability}
                    >
                      Check Availability
                    </Button>
                  )}

                  {isAvailable && (
                    <Button
                      className="primary-button mt-3 full-width-button"
                      onClick={bookNow}
                    >
                      Book Now
                    </Button>
                  )}
                </div>
              </Col>
            </Row>
          </div>
        )}
      </Layout>
    </div>
  );
}
