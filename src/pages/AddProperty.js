import { useState, useRef } from "react";
import axios from "axios";
import "./AddProperty.css";

export default function AddProperty() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
    e.target.value = "";
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

    const f = e.target;
    const newErrors = {};

    if (!f.address.value) newErrors.address = "Address is required";
    if (!f.building.value) newErrors.building = "Building name is required";
    if (!f.type.value) newErrors.type = "Select room type";
    if (!f.furnishing.value) newErrors.furnishing = "Select furnishing";
    if (!f.tenantType.value) newErrors.tenantType = "Select tenant type";
    if (!f.bikeparking.value) newErrors.bikeparking = "Select Bike parking option";
    if (!f.carparking.value) newErrors.carparking = "Select Car parking option";
    if (!f.powerBackup.value) newErrors.powerBackup = "Select power backup";
    if (!f.geyser.value) newErrors.geyser = "Select geyser option";
    if (!f.security.value) newErrors.security = "Select security option";
    if (!f.cctv.value) newErrors.cctv = "Select CCTV option";
    if (!f.bathrooms.value) newErrors.bathrooms = "Select bathrooms";
    if (!f.floor.value) newErrors.floor = "Floor is required";
    if (!f.flat.value) newErrors.flat = "Flat number is required";
    if (!f.colony.value) newErrors.colony = "Colony is required";
    if (!f.area.value) newErrors.area = "Area is required";
    if (!f.pincode.value) newErrors.pincode = "Pincode is required";
    if (!f.rent.value) newErrors.rent = "Rent is required";
    if (!f.advance.value) newErrors.advance = "Advance is required";
    if (!f.contact.value) newErrors.contact = "contact is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("address", f.address.value);
      formData.append("building", f.building.value);
      formData.append("type", f.type.value);
      formData.append("furnishing", f.furnishing.value);
      formData.append("tenantType", f.tenantType.value);
      formData.append("bikeparking", f.bikeparking.value);
      formData.append("carparking", f.carparking.value);
      formData.append("powerBackup", f.powerBackup.value);
      formData.append("geyser", f.geyser.value);
      formData.append("security", f.security.value);
      formData.append("cctv", f.cctv.value);
      formData.append("bathrooms", f.bathrooms.value);
      formData.append("floor", f.floor.value);
      formData.append("flat", f.flat.value);
      formData.append("colony", f.colony.value);
      formData.append("area", f.area.value);
      formData.append("pincode", f.pincode.value);
      formData.append("rent", f.rent.value);
      formData.append("advance", f.advance.value);
      formData.append("contact", f.contact?.value);

      images.forEach((img) => {
        formData.append("images", img);
      });

      await axios.post(
        "https://roombuddy-api.onrender.com/api/properties",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      alert("Property Saved Successfully!");
      setImages([]);
      fileInputRef.current.value = "";
      f.reset();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        "Upload failed";

      console.error("UPLOAD ERROR:", msg);
      alert(msg);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (value && errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };


  return (
    <div className="add-property">
      <h2>Add Property</h2>

      <form onSubmit={handleSubmit}>
        <input name="address" placeholder="Address" onChange={handleChange} />
        {errors.address && <span className="error-text">{errors.address}</span>}

        <input name="building" placeholder="Building Name" onChange={handleChange} />
        {errors.building && <span className="error-text">{errors.building}</span>}

        <select name="type" onChange={handleChange}>
          <option value="">Select Room Type</option>
          <option>1RK</option>
          <option>1BHK</option>
          <option>2BHK</option>
          <option>3BHK</option>
        </select>
        {errors.type && <span className="error-text">{errors.type}</span>}

        <select name="furnishing" onChange={handleChange}>
          <option value="">Select Furnishing</option>
          <option>Furnished</option>
          <option>Semi-Furnished</option>
          <option>Unfurnished</option>
        </select>
        {errors.furnishing && <span className="error-text">{errors.furnishing}</span>}

        <select name="tenantType" onChange={handleChange}>
          <option value="">Tenant Type</option>
          <option>Family</option>
          <option>Bachelor</option>
        </select>
        {errors.tenantType && <span className="error-text">{errors.tenantType}</span>}

        <select name="bikeparking" onChange={handleChange}>
          <option value="">Bike Parking</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        {errors.bikeparking && <span className="error-text">{errors.bikeparking}</span>}

        <select name="carparking" onChange={handleChange}>
          <option value="">Car Parking</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        {errors.carparking && <span className="error-text">{errors.carparking}</span>}

        <select name="powerBackup" onChange={handleChange}>
          <option value="">Power Backup</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        {errors.powerBackup && <span className="error-text">{errors.powerBackup}</span>}

        <select name="geyser" onChange={handleChange}>
          <option value="">Geyser</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        {errors.geyser && <span className="error-text">{errors.geyser}</span>}

        <select name="security" onChange={handleChange}>
          <option value="">Security</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        {errors.security && <span className="error-text">{errors.security}</span>}

        <select name="cctv" onChange={handleChange}>
          <option value="">CCTV</option>
          <option>Yes</option>
          <option>No</option>
        </select>
        {errors.cctv && <span className="error-text">{errors.cctv}</span>}

        <select name="bathrooms" onChange={handleChange}>
          <option value="">Bathrooms</option>
          <option>1</option>
          <option>2</option>
          <option>3</option>
          <option>4</option>
        </select>
        {errors.bathrooms && <span className="error-text">{errors.bathrooms}</span>}

        <input name="floor" placeholder="Floor Number" onChange={handleChange} />
        {errors.floor && <span className="error-text">{errors.floor}</span>}

        <input name="flat" placeholder="Flat Number" onChange={handleChange} />
        {errors.flat && <span className="error-text">{errors.flat}</span>}

        <input name="colony" placeholder="Colony / Street" onChange={handleChange} />
        {errors.colony && <span className="error-text">{errors.colony}</span>}

        <input name="area" placeholder="Area Name" onChange={handleChange} />
        {errors.area && <span className="error-text">{errors.area}</span>}

        <input name="pincode" placeholder="Pincode" onChange={handleChange} />
        {errors.pincode && <span className="error-text">{errors.pincode}</span>}

        <input name="rent" type="number" placeholder="Rent Price" onChange={handleChange} />
        {errors.rent && <span className="error-text">{errors.rent}</span>}

        <select name="advance" onChange={handleChange}>
          <option value="">Advance</option>
          <option>1 month</option>
          <option>2 months</option>
          <option>3 months</option>
          <option>4 months</option>
          <option>5 months</option>
          <option>6 months</option>
        </select>
        {errors.advance && <span className="error-text">{errors.advance}</span>}

        <input name="contact" placeholder="Contact Number" onChange={handleChange} />
        {errors.contact && <span className="error-text">{errors.contact}</span>}

        <label className="file-label">Upload Property Images</label>
        <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleImageChange} />

        {images.length > 0 && (
          <div className="image-preview">
            {images.map((img, i) => (
              <div key={i} className="image-wrapper">
                <img src={URL.createObjectURL(img)} alt="" />
                <button type="button" className="remove-btn" onClick={() => handleRemoveImage(i)} style={{ background: "darkred" }}>
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <button type="submit" disabled={loading} style={{ padding: "10px 24px" }}>
          {loading ? "Saving..." : "Save Property"}
        </button>
      </form>
    </div>
  );
}