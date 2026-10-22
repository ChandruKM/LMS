"use client";

import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateProfile } from "../../redux/slices/authSlice";
import { editEmployee } from "../../redux/slices/employeeSlice";
import { apiClient } from "../../lib/apiClient";
import { useToast } from "../../app/providers";
import Modal from "./Modal";
import Button from "./Button";
import {
  Camera,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sparkles,
  Link as LinkIcon,
  X,
} from "lucide-react";

// Curated collection of high quality professional avatars
const CURATED_AVATARS = [
  {
    id: "av1",
    label: "Professional 1",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "av2",
    label: "Professional 2",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "av3",
    label: "Professional 3",
    url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "av4",
    label: "Professional 4",
    url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "av5",
    label: "Professional 5",
    url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "av6",
    label: "Professional 6",
    url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "av7",
    label: "Professional 7",
    url: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "av8",
    label: "Professional 8",
    url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "av9",
    label: "Professional 9",
    url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "av10",
    label: "Professional 10",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "av11",
    label: "Professional 11",
    url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
  },
  {
    id: "av12",
    label: "Professional 12",
    url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80",
  },
];

export default function ProfilePictureUploader({
  size = 96,
  showChangeButton = true,
  targetUser = null,
  onAvatarUpdated = null,
}) {
  const dispatch = useDispatch();
  const { addToast } = useToast();
  const currentUser = useSelector((state) => state.auth.user);
  const activeUser = targetUser || currentUser;

  const [modalOpen, setModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("upload"); // "upload" | "gallery" | "url"
  const [selectedAvatar, setSelectedAvatar] = useState(activeUser?.avatar || "");
  const [customUrl, setCustomUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState(activeUser?.avatar || "");
  const [uploadError, setUploadError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const fileInputRef = useRef(null);

  const currentDisplayAvatar =
    activeUser?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      activeUser?.name || "Apex User"
    )}&background=2563EB&color=fff&bold=true`;

  const openModal = () => {
    setSelectedAvatar(activeUser?.avatar || "");
    setPreviewUrl(currentDisplayAvatar);
    setUploadError("");
    setCustomUrl("");
    setModalOpen(true);
  };

  // Resize and compress uploaded image to square avatar using Canvas
  const processImageFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setUploadError("Please choose a valid image file (PNG, JPG, WebP, etc.).");
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError("File size exceeds 8MB. Please select a smaller photo.");
      return;
    }

    setIsProcessing(true);
    setUploadError("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          // Crop and resize to clean 320x320 square
          const canvas = document.createElement("canvas");
          const size = 320;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");

          // Determine center crop coordinates
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);

          // Get optimized base64 data url
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          setSelectedAvatar(compressedDataUrl);
          setPreviewUrl(compressedDataUrl);
          setIsProcessing(false);
        } catch (err) {
          console.error("Canvas processing error:", err);
          setSelectedAvatar(e.target.result);
          setPreviewUrl(e.target.result);
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setUploadError("Unable to load image. Please try a different file.");
        setIsProcessing(false);
      };
      img.src = e.target.result;
    };
    reader.onerror = () => {
      setUploadError("Error reading file.");
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) processImageFile(file);
  };

  const handleApplyUrl = () => {
    if (!customUrl.trim()) return;
    setSelectedAvatar(customUrl.trim());
    setPreviewUrl(customUrl.trim());
    addToast("Image link applied to preview.", "info");
  };

  const handleResetToInitials = () => {
    const initialsUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      activeUser?.name || "Apex User"
    )}&background=2563EB&color=fff&bold=true`;
    setSelectedAvatar(initialsUrl);
    setPreviewUrl(initialsUrl);
  };

  const handleSaveAvatar = async () => {
    if (!previewUrl) return;

    setIsProcessing(true);
    const newAvatar = previewUrl;

    try {
      // 1. Update active user in Redux Auth Slice
      dispatch(updateProfile({ avatar: newAvatar }));

      // 2. Update employee roster in Redux Employee Slice
      if (activeUser?.id) {
        dispatch(editEmployee({ id: activeUser.id, avatar: newAvatar }));

        // 3. Sync with backend API if available
        apiClient.employees
          .update(activeUser.id, { avatar: newAvatar })
          .catch((err) =>
            console.warn("[Backend Sync] Avatar update warning:", err.message)
          );
      }

      if (onAvatarUpdated) {
        onAvatarUpdated(newAvatar);
      }

      addToast("Profile picture updated successfully!", "success");
      setModalOpen(false);
    } catch (err) {
      console.error("Failed to update avatar:", err);
      addToast("Failed to update profile picture. Please try again.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Avatar Container with Hover Overlay */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          onClick={openModal}
          style={{
            position: "relative",
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            cursor: "pointer",
            flexShrink: 0,
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.1)",
            border: "3px solid #FFFFFF",
            outline: "2px solid #2563EB",
            overflow: "hidden",
            transition: "all 0.2s ease",
          }}
          title="Click to change profile picture"
          className="profile-avatar-wrapper"
        >
          <img
            src={currentDisplayAvatar}
            alt={activeUser?.name || "Profile"}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />

          {/* Camera Overlay Badge on Hover */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(15, 23, 42, 0.45)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              opacity: 0,
              transition: "opacity 0.2s ease",
            }}
            className="avatar-hover-overlay"
          >
            <Camera size={size > 70 ? 22 : 16} />
            {size > 70 && (
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: "600",
                  marginTop: "3px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Change
              </span>
            )}
          </div>
        </div>

        {showChangeButton && (
          <div>
            <button
              type="button"
              onClick={openModal}
              className="btn btn-secondary btn-sm"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12.5px",
                fontWeight: "600",
                padding: "7px 14px",
                borderRadius: "8px",
              }}
            >
              <Camera size={15} />
              Change Picture
            </button>
            <p
              style={{
                fontSize: "11px",
                color: "var(--text-muted)",
                marginTop: "4px",
                marginBottom: 0,
              }}
            >
              JPG, PNG or select from gallery
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .profile-avatar-wrapper:hover .avatar-hover-overlay {
          opacity: 1 !important;
        }
        .profile-avatar-wrapper:hover {
          transform: scale(1.03);
        }
      `}</style>

      {/* Profile Picture Update Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Update Profile Picture"
        size="md"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Top Live Preview Banner */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              padding: "16px",
              background: "linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%)",
              borderRadius: "14px",
              border: "1px solid var(--border)",
            }}
          >
            <div
              style={{
                width: "74px",
                height: "74px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "3px solid #FFFFFF",
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)",
                flexShrink: 0,
              }}
            >
              <img
                src={previewUrl || currentDisplayAvatar}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <h4
                style={{
                  fontSize: "15px",
                  fontWeight: "700",
                  color: "var(--text-main)",
                  marginBottom: "4px",
                }}
              >
                {activeUser?.name || "ApexTech Employee"}
              </h4>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--text-muted)",
                  margin: 0,
                }}
              >
                This photo will be displayed across your profile, top bar, and leave applications.
              </p>
            </div>
            <button
              type="button"
              onClick={handleResetToInitials}
              className="btn btn-ghost btn-sm"
              title="Reset to initials"
              style={{
                fontSize: "11px",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                color: "var(--text-secondary)",
              }}
            >
              <RotateCcw size={13} />
              Reset
            </button>
          </div>

          {/* Options Navigation Tabs */}
          <div
            style={{
              display: "flex",
              background: "var(--background)",
              padding: "4px",
              borderRadius: "10px",
              border: "1px solid var(--border)",
              gap: "4px",
            }}
          >
            <button
              type="button"
              onClick={() => setActiveTab("upload")}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "13px",
                fontWeight: activeTab === "upload" ? "700" : "500",
                color: activeTab === "upload" ? "var(--primary)" : "var(--text-secondary)",
                background: activeTab === "upload" ? "#FFFFFF" : "transparent",
                border: "none",
                borderRadius: "8px",
                boxShadow: activeTab === "upload" ? "0 2px 5px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.15s ease",
              }}
            >
              <Upload size={15} />
              Upload Photo
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("gallery")}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "13px",
                fontWeight: activeTab === "gallery" ? "700" : "500",
                color: activeTab === "gallery" ? "var(--primary)" : "var(--text-secondary)",
                background: activeTab === "gallery" ? "#FFFFFF" : "transparent",
                border: "none",
                borderRadius: "8px",
                boxShadow: activeTab === "gallery" ? "0 2px 5px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.15s ease",
              }}
            >
              <Sparkles size={15} />
              Choose Avatar
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("url")}
              style={{
                flex: 1,
                padding: "8px 12px",
                fontSize: "13px",
                fontWeight: activeTab === "url" ? "700" : "500",
                color: activeTab === "url" ? "var(--primary)" : "var(--text-secondary)",
                background: activeTab === "url" ? "#FFFFFF" : "transparent",
                border: "none",
                borderRadius: "8px",
                boxShadow: activeTab === "url" ? "0 2px 5px rgba(0,0,0,0.06)" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                transition: "all 0.15s ease",
              }}
            >
              <LinkIcon size={15} />
              Web Link
            </button>
          </div>

          {/* Tab 1: Upload from Computer */}
          {activeTab === "upload" && (
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />

              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? "var(--primary)" : "var(--border)"}`,
                  background: dragOver ? "var(--primary-light)" : "var(--background)",
                  borderRadius: "12px",
                  padding: "36px 20px",
                  textAlign: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "var(--primary-light)",
                    color: "var(--primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <Upload size={22} />
                </div>
                <h5 style={{ fontSize: "14px", fontWeight: "700", marginBottom: "4px" }}>
                  {dragOver ? "Drop image to upload" : "Click to select a photo from your computer"}
                </h5>
                <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                  Supports PNG, JPG, GIF or WebP up to 8MB. Auto-centered square crop.
                </p>
              </div>

              {uploadError && (
                <div
                  style={{
                    marginTop: "10px",
                    padding: "8px 12px",
                    background: "#FEE2E2",
                    color: "#DC2626",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                >
                  {uploadError}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Curated Professional Avatars */}
          {activeTab === "gallery" && (
            <div>
              <p
                style={{
                  fontSize: "12.5px",
                  color: "var(--text-secondary)",
                  marginBottom: "12px",
                }}
              >
                Choose from ApexTech enterprise-approved professional profile avatars:
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(6, 1fr)",
                  gap: "10px",
                  maxHeight: "220px",
                  overflowY: "auto",
                  padding: "4px",
                }}
              >
                {CURATED_AVATARS.map((av) => {
                  const isSelected = previewUrl === av.url;
                  return (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => {
                        setSelectedAvatar(av.url);
                        setPreviewUrl(av.url);
                      }}
                      style={{
                        position: "relative",
                        aspectRatio: "1",
                        borderRadius: "50%",
                        padding: 0,
                        border: isSelected ? "3px solid #2563EB" : "2px solid transparent",
                        boxShadow: isSelected ? "0 0 0 2px rgba(37, 99, 235, 0.3)" : "none",
                        cursor: "pointer",
                        overflow: "hidden",
                        background: "none",
                        transition: "all 0.15s ease",
                        transform: isSelected ? "scale(1.06)" : "scale(1)",
                      }}
                    >
                      <img
                        src={av.url}
                        alt={av.label}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      {isSelected && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(37, 99, 235, 0.45)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#FFFFFF",
                          }}
                        >
                          <Check size={18} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Custom Image URL */}
          {activeTab === "url" && (
            <div>
              <div className="form-group" style={{ marginBottom: "12px" }}>
                <label className="form-label">Direct Image URL</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="url"
                    className="form-control"
                    placeholder="https://example.com/your-photo.jpg"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={handleApplyUrl}
                  >
                    Preview
                  </Button>
                </div>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                Paste any publicly accessible URL for your profile photo.
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              paddingTop: "16px",
              borderTop: "1px solid var(--border)",
            }}
          >
            <Button
              type="button"
              variant="secondary"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              icon={Check}
              loading={isProcessing}
              onClick={handleSaveAvatar}
            >
              Save Picture
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
