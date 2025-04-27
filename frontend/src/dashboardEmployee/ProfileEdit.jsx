import React, { useState, useEffect } from "react";
import { Modal, Form, Button } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";

const ProfileEdit = ({ user: propUser, onUpdate, show, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    middleName: "",
    lastName: "",
    contact: "",
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propUser) {
      setFormData({
        fullName: propUser.fullName || "",
        middleName: propUser.middleName || "",
        lastName: propUser.lastName || "",
        contact: propUser.contact || "",
        username: propUser.username || "",
        password: "",
        confirmPassword: "",
      });

      // Set the preview to the current profile picture
      setPreview(
        propUser.profileIcon
          ? `http://localhost:8000/images/${propUser.profileIcon}`
          : null
      );
    }
  }, [propUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
      setPreview(URL.createObjectURL(file)); // Show a preview of the uploaded image
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    // Validate passwords
    if (formData.password && formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      setLoading(false);
      return;
    }
  
    const formDataToSend = new FormData();
  
    // Only append fields that are not empty
    if (formData.fullName.trim()) formDataToSend.append("fullName", formData.fullName);
    if (formData.middleName.trim()) formDataToSend.append("middleName", formData.middleName);
    if (formData.lastName.trim()) formDataToSend.append("lastName", formData.lastName);
    if (formData.contact.trim()) formDataToSend.append("contact", formData.contact);
    if (formData.username.trim()) formDataToSend.append("username", formData.username);
    if (formData.password.trim()) formDataToSend.append("password", formData.password);
    if (file) formDataToSend.append("profilePic", file);
  
    try {
      const response = await fetch(`http://localhost:8000/api/profile/${propUser.id}`, {
        method: "PUT",
        body: formDataToSend,
      });
  
      const data = await response.json();
      if (response.ok) {
        onUpdate(data.user); // Update the parent component with the new user data
        onClose();
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <div className="row">
            <div className="col-md-4 text-center mb-4">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile Preview"
                  className="rounded-circle mb-3"
                  style={{ width: "150px", height: "150px", objectFit: "cover" }}
                  onError={(e) => {
                    e.target.onerror = null; // Prevent infinite loop
                    e.target.src = "/path/to/default-image.png"; // Fallback image
                  }}
                />
              ) : (
                <div
                  className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3"
                  style={{ width: "150px", height: "150px", margin: "0 auto" }}
                >
                  <FaUserCircle size={80} className="text-secondary" />
                </div>
              )}
              <Form.Group controlId="formFile">
                <Form.Label>Change Profile Picture (Optional)</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
              </Form.Group>
            </div>

            <div className="col-md-8">
              <div className="row">
                <Form.Group className="col-md-6 mb-3">
                  <Form.Label>First Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current"
                  />
                </Form.Group>

                <Form.Group className="col-md-6 mb-3">
                  <Form.Label>Middle Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current"
                  />
                </Form.Group>

                <Form.Group className="col-md-6 mb-3">
                  <Form.Label>Last Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current"
                  />
                </Form.Group>

                <Form.Group className="col-md-6 mb-3">
                  <Form.Label>Contact Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="contact"
                    value={formData.contact}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current"
                  />
                </Form.Group>

                <Form.Group className="col-md-6 mb-3">
                  <Form.Label>New Password (Optional)</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Leave blank to keep current"
                  />
                </Form.Group>

                <Form.Group className="col-md-6 mb-3">
                  <Form.Label>Confirm Password</Form.Label>
                  <Form.Control
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm new password if changing"
                  />
                </Form.Group>
              </div>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <Button variant="secondary" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default ProfileEdit;