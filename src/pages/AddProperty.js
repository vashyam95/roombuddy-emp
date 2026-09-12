import { useState, useRef, useEffect } from "react";
import axios from "axios";
import "./AddProperty.css";

export default function AddProperty() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [existingImages, setExistingImages] = useState([]);

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

    if (!coords.lat || !coords.lng) {
      alert("Location missing for this property");
      setLoading(false);
      return;
    }

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
      formData.append("latitude", coords.lat);
      formData.append("longitude", coords.lng);

      existingImages.forEach((imgUrl) => formData.append("existingImages", imgUrl));
      images.forEach((img) => formData.append("images", img));

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
      const msg = err.response?.data?.message || err.message || "Upload failed";
      console.error("UPLOAD ERROR:", msg);
      alert(msg);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchApprovedProperty();
  }, []);

  const fetchApprovedProperty = async () => {
    try {
      const res = await axios.get("https://roombuddy-api.onrender.com/api/owner-postings");
      const data = Array.isArray(res.data.data) ? res.data.data : res.data;
      const approvedProperty = data.find((item) => item.status?.toLowerCase() === "approved");
      if (!approvedProperty) return;

      setCoords({
        lat: approvedProperty.latitude || null,
        lng: approvedProperty.longitude || null,
      });

      const form = document.querySelector("form");
      form.address.value = approvedProperty.area || "";
      form.building.value = approvedProperty.building || "";
      form.type.value = approvedProperty.type || "";
      form.furnishing.value = approvedProperty.furnishing || "";
      form.tenantType.value = approvedProperty.tenantType || "";
      form.bikeparking.value = approvedProperty.bikeparking || "";
      form.carparking.value = approvedProperty.carparking || "";
      form.powerBackup.value = approvedProperty.powerBackup || "";
      form.geyser.value = approvedProperty.geyser || "";
      form.security.value = approvedProperty.security || "";
      form.cctv.value = approvedProperty.cctv || "";
      form.bathrooms.value = approvedProperty.bathrooms || "";
      form.floor.value = approvedProperty.floor || "";
      form.flat.value = approvedProperty.flat || "";
      form.pincode.value = approvedProperty.pincode || "";
      form.rent.value = approvedProperty.rent || "";
      form.advance.value = approvedProperty.advance || "";
      form.contact.value = approvedProperty.altContact || "";

      setExistingImages(approvedProperty.images || []);
    } catch (err) {
      console.error("Error fetching approved property:", err);
    }
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="add-property">
      <header className="ap-header">
        <div>
          <h2>Add Property</h2>
          <p>Fill in the details to list a new property on RoomBuddy</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="ap-form">
        {/* LOCATION */}
        <section className="ap-section">
          <h3 className="ap-section__title">Location Details</h3>
          <div className="ap-grid">
            <div className="ap-field ap-field--full">
              <label>Address</label>
              <input name="address" placeholder="Full address" onChange={handleChange} />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            <div className="ap-field">
              <label>Building Name</label>
              <input name="building" placeholder="e.g. Sunrise Apartments" onChange={handleChange} />
              {errors.building && <span className="error-text">{errors.building}</span>}
            </div>

            <div className="ap-field">
              <label>Colony / Street</label>
              <input name="colony" placeholder="Colony or street" onChange={handleChange} />
              {errors.colony && <span className="error-text">{errors.colony}</span>}
            </div>

            <div className="ap-field">
              <label>Area</label>
              <input name="area" placeholder="Area name" onChange={handleChange} />
              {errors.area && <span className="error-text">{errors.area}</span>}
            </div>

            <div className="ap-field">
              <label>Pincode</label>
              <input name="pincode" placeholder="Pincode" onChange={handleChange} />
              {errors.pincode && <span className="error-text">{errors.pincode}</span>}
            </div>

            <div className="ap-field">
              <label>Floor Number</label>
              <input name="floor" placeholder="Floor" onChange={handleChange} />
              {errors.floor && <span className="error-text">{errors.floor}</span>}
            </div>

            <div className="ap-field">
              <label>Flat Number</label>
              <input name="flat" placeholder="Flat" onChange={handleChange} />
              {errors.flat && <span className="error-text">{errors.flat}</span>}
            </div>
          </div>
        </section>

        {/* PROPERTY */}
        <section className="ap-section">
          <h3 className="ap-section__title">Property Details</h3>
          <div className="ap-grid">
            <div className="ap-field">
              <label>Room Type</label>
              <select name="type" onChange={handleChange}>
                <option value="">Select Room Type</option>
                <option>1RK</option><option>1BHK</option><option>2BHK</option><option>3BHK</option>
              </select>
              {errors.type && <span className="error-text">{errors.type}</span>}
            </div>

            <div className="ap-field">
              <label>Furnishing</label>
              <select name="furnishing" onChange={handleChange}>
                <option value="">Select Furnishing</option>
                <option>Furnished</option><option>Semi-Furnished</option><option>Unfurnished</option>
              </select>
              {errors.furnishing && <span className="error-text">{errors.furnishing}</span>}
            </div>

            <div className="ap-field">
              <label>Tenant Type</label>
              <select name="tenantType" onChange={handleChange}>
                <option value="">Tenant Type</option>
                <option>Family</option><option>Bachelor</option><option>Family or Bachelor</option>
              </select>
              {errors.tenantType && <span className="error-text">{errors.tenantType}</span>}
            </div>

            <div className="ap-field">
              <label>Bathrooms</label>
              <select name="bathrooms" onChange={handleChange}>
                <option value="">Bathrooms</option>
                <option>1</option><option>2</option><option>3</option><option>4</option>
              </select>
              {errors.bathrooms && <span className="error-text">{errors.bathrooms}</span>}
            </div>
          </div>
        </section>

        {/* AMENITIES */}
        <section className="ap-section">
          <h3 className="ap-section__title">Amenities</h3>
          <div className="ap-grid">
            {[
              ["bikeparking", "Bike Parking"],
              ["carparking", "Car Parking"],
              ["powerBackup", "Power Backup"],
              ["geyser", "Geyser"],
              ["security", "Security"],
              ["cctv", "CCTV"],
            ].map(([name, label]) => (
              <div className="ap-field" key={name}>
                <label>{label}</label>
                <select name={name} onChange={handleChange}>
                  <option value="">{label}</option>
                  <option>Yes</option>
                  <option>No</option>
                </select>
                {errors[name] && <span className="error-text">{errors[name]}</span>}
              </div>
            ))}
          </div>
        </section>

        {/* PRICING & CONTACT */}
        <section className="ap-section">
          <h3 className="ap-section__title">Pricing & Contact</h3>
          <div className="ap-grid">
            <div className="ap-field">
              <label>Rent Price</label>
              <input name="rent" type="number" placeholder="₹ per month" onChange={handleChange} />
              {errors.rent && <span className="error-text">{errors.rent}</span>}
            </div>

            <div className="ap-field">
              <label>Advance</label>
              <select name="advance" onChange={handleChange}>
                <option value="">Advance</option>
                <option>1 month</option><option>2 months</option><option>3 months</option>
                <option>4 months</option><option>5 months</option><option>6 months</option>
              </select>
              {errors.advance && <span className="error-text">{errors.advance}</span>}
            </div>

            <div className="ap-field">
              <label>Contact Number</label>
              <input name="contact" placeholder="Phone number" onChange={handleChange} />
              {errors.contact && <span className="error-text">{errors.contact}</span>}
            </div>
          </div>
        </section>

        {/* IMAGES */}
        <section className="ap-section">
          <h3 className="ap-section__title">Property Images</h3>

          <label className="ap-dropzone" htmlFor="ap-file-input">
            <div className="ap-dropzone__icon">📷</div>
            <div className="ap-dropzone__text">
              <strong>Click to upload</strong> or drop images here
            </div>
            <span className="ap-dropzone__hint">PNG, JPG up to several MB</span>
            <input
              id="ap-file-input"
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
          </label>

          {existingImages.length > 0 && (
            <>
              <p className="ap-images-label">Existing images</p>
              <div className="image-preview">
                {existingImages.map((img, i) => (
                  <div key={i} className="image-wrapper">
                    <img src={img} alt="existing" />

                    <button
                      type="button"
                      className="remove-btn"
                      onClick={() => handleRemoveExistingImage(i)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {images.length > 0 && (
            <>
              <p className="ap-images-label">New uploads</p>
              <div className="image-preview">
                {images.map((img, i) => (
                  <div key={i} className="image-wrapper">
                    <img src={URL.createObjectURL(img)} alt="" />
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
            </>
          )}
        </section>

        <div className="ap-actions">
          <button type="submit" disabled={loading} className="ap-submit">
            {loading ? "Saving..." : "Save Property"}
          </button>
        </div>
      </form>
    </div>
  );
}
