import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import DishImageModalContent from "./DishImageModalContent";
import Link from "next/link";
import { Box, IconButton, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

export default function DishImage({
  urls,
  alt,
  captions = [],
  onPhotoError,
  autoPlay = false,
  business_id,
  business_name,
  showRestaurantName = true,
  showRestaurantInlineName = false,
}) {
  const [showModal, setShowModal] = useState(false);
  const hoverTimerRef = useRef();
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const intervalRef = useRef();

  useEffect(() => {
    if (hovered && urls.length > 1) {
      hoverTimerRef.current = setTimeout(() => setShowModal(true), 5000);
    } else {
      clearTimeout(hoverTimerRef.current);
    }
    return () => clearTimeout(hoverTimerRef.current);
  }, [hovered, urls]);

  useEffect(() => {
    if ((autoPlay || hovered) && urls && urls.length > 1) {
      intervalRef.current = setInterval(() => {
        setIndex((i) => (i + 1) % urls.length);
      }, 2500);
      return () => clearInterval(intervalRef.current);
    } else {
      clearInterval(intervalRef.current);
    }
  }, [hovered, urls, autoPlay]);

  if (!urls || urls.length === 0) return null;

  const handleError = () => {
    if (index < urls.length - 1) {
      setIndex(index + 1);
    } else if (onPhotoError) {
      onPhotoError();
    }
  };

  const prev = (e) => {
    e.stopPropagation();
    setIndex((i) => (i - 1 + urls.length) % urls.length);
  };
  const next = (e) => {
    e.stopPropagation();
    setIndex((i) => (i + 1) % urls.length);
  };

  useEffect(() => {
    if (!showModal) return;
    const handleKey = (e) => {
      if (e.key === "Escape") setShowModal(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showModal]);

  const modal = showModal
    ? createPortal(
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            bgcolor: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(6px)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowModal(false)}
        >
          <Box
            sx={{
              bgcolor: "#000",
              borderRadius: 3,
              p: 4,
              boxShadow: 10,
              minWidth: 420,
              minHeight: 420,
              position: "relative",
              maxWidth: "90vw",
              maxHeight: "90vh",
              color: "#fff",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <DishImageModalContent
              urls={urls}
              captions={captions}
              alt={alt}
              onPhotoError={onPhotoError}
              startIndex={index}
              business_name={showRestaurantInlineName ? business_name : undefined}
            />
            {business_id && business_name && (
              <Box sx={{ mt: 4, textAlign: "center" }}>
                <Link
                  href={{
                    pathname: "/restaurant",
                    query: { business_id, restaurant_name: business_name },
                  }}
                  passHref
                  legacyBehavior
                >
                  <a
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 7,
                      color: "#fff",
                      background: "#222",
                      borderRadius: 6,
                      padding: "8px 18px",
                      fontWeight: 500,
                      fontSize: 17,
                      textDecoration: "none",
                      boxShadow: "0 2px 12px #000a",
                    }}
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M3 10L10 4L17 10"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M5 10V17H15V10"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {business_name}
                  </a>
                </Link>
              </Box>
            )}
          </Box>
        </Box>,
        document.body
      )
    : null;

  return (
    <div>
      {modal}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: 180,
          borderRadius: 2,
          overflow: "hidden",
          cursor: urls.length > 1 ? "pointer" : "default",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <img
          src={urls[index]}
          alt={alt}
          onError={handleError}
          style={{
            width: "100%",
            height: 180,
            objectFit: "cover",
            borderRadius: 8,
            transition: "opacity 0.3s",
          }}
        />
        {urls.length > 1 && hovered && (
          <>
            <IconButton
              onClick={prev}
              sx={{
                position: "absolute",
                left: 8,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.7)",
                width: 28,
                height: 28,
                zIndex: 2,
              }}
              size="small"
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              onClick={next}
              sx={{
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(255,255,255,0.7)",
                width: 28,
                height: 28,
                zIndex: 2,
              }}
              size="small"
            >
              <ChevronRightIcon />
            </IconButton>
          </>
        )}
        {urls.length > 1 && (
          <Typography
            sx={{
              position: "absolute",
              bottom: 8,
              left: 0,
              right: 0,
              textAlign: "center",
              color: "#fff",
              fontWeight: "bold",
              textShadow: "0 0 4px #000",
              fontSize: 13,
            }}
          >
            {index + 1} / {urls.length}
          </Typography>
        )}
      </Box>
      {hovered && captions && captions[index] && (
        <Typography
          sx={{
            fontSize: 15,
            fontStyle: "italic",
            color: "#444",
            mt: 2,
            minHeight: 22,
            textAlign: "center",
            maxWidth: 380,
          }}
        >
          {captions[index]}
          {showRestaurantInlineName && business_name && (
            <span
              style={{
                display: "block",
                fontStyle: "normal",
                color: "#888",
                fontWeight: 500,
                fontSize: 14,
                marginTop: 2,
              }}
            >
              {business_name}
            </span>
          )}
        </Typography>
      )}
    </div>
  );
}
