import { useState, useRef } from "react";
import axios from "axios";
import "./AddProperty.css";

export default function AddProperty() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    e.target.value = ""; // reset input after selecting
  };

  const handleRemoveImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    if (updatedImages.length === 0 && fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("address", e.target.address.value);
      formData.append("building", e.target.building.value);
      formData.append("type", e.target.type.value);
      formData.append("floor", e.target.floor.value);
      formData.append("flat", e.target.flat.value);
      formData.append("colony", e.target.colony.value);
      formData.append("area", e.target.area.value);
      formData.append("pincode", e.target.pincode.value);
      formData.append("rent", e.target.rent.value);
      formData.append("advance", e.target.advance.value);
      formData.append("contact", e.target.contact?.value || ""); // optional

      images.forEach((img) => {
        formData.append("images", img);
      });

      // ✅ Send POST request to API
      const res = await axios.post(
        "https://roombuddy-api.onrender.com/api/properties",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Property Saved Successfully!");
      setImages([]);
      fileInputRef.current.value = "";
      e.target.reset();
    } catch (err) {
      console.error("Error saving property:", err);
      alert("Failed to save property. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="add-property">
      <h2>Add Property</h2>
      <form onSubmit={handleSubmit}>
        <input name="address" type="text" placeholder="Address" required />
        <input name="building" type="text" placeholder="Building Name" required />
         <input name="type" type="text" placeholder="Room Type" required />
        <input name="floor" type="text" placeholder="Floor Number" required />
        <input name="flat" type="text" placeholder="Flat Number" required />
        <input name="colony" type="text" placeholder="Colony / Street Name" required />
        <input name="area" type="text" placeholder="Area Name" required />
        <input name="pincode" type="text" placeholder="Pincode" required />
        <input name="rent" type="number" placeholder="Rent Price" required />
        <input name="advance" type="text" placeholder="Advance Rent" required />
        <input name="contact" type="text" placeholder="Contact Number" />

        <label className="file-label">Upload Property Images</label>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageChange}
        />

        {images.length > 0 && (
          <div className="image-preview">
            {images.map((img, i) => (
              <div key={i} className="image-wrapper">
                <img src={URL.createObjectURL(img)} alt="preview" />
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveImage(i)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" style={{ padding: "10px 20px" }} disabled={loading}>
          {loading ? "Saving..." : "Save Property"}
        </button>
      </form>
    </div>
  );
}
