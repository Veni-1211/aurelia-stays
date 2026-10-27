const CURRENCY = "₹";

document.addEventListener("DOMContentLoaded", function () {
  setupDateInputs();

  setupHomeFavorites();

  initializeHotelsPage();
});

function searchHotels() {
  const locationInput = document.getElementById("locationInput");

  const checkInInput = document.getElementById("checkIn");

  const checkOutInput = document.getElementById("checkOut");

  const guestsInput = document.getElementById("guests");

  if (!locationInput) {
    console.error("locationInput not found");

    return;
  }

  const location = locationInput.value.trim();

  const checkIn = checkInInput ? checkInInput.value : "";

  const checkOut = checkOutInput ? checkOutInput.value : "";

  const guests = guestsInput ? guestsInput.value : "1";

  /* =====================================================
       LOCATION VALIDATION
    ===================================================== */

  if (location === "") {
    alert("Please enter a city, hotel or neighborhood.");

    locationInput.focus();

    return;
  }

  /* =====================================================
       CHECK-IN VALIDATION
    ===================================================== */

  if (checkIn === "") {
    alert("Please select your check-in date.");

    return;
  }

  /* =====================================================
       CHECK-OUT VALIDATION
    ===================================================== */

  if (checkOut === "") {
    alert("Please select your check-out date.");

    return;
  }

  /* =====================================================
       DATE VALIDATION
    ===================================================== */

  if (checkOut <= checkIn) {
    alert("Check-out date must be after check-in date.");

    return;
  }

  /* =====================================================
       SAVE SEARCH
    ===================================================== */

  localStorage.setItem("searchLocation", location);

  localStorage.setItem("checkIn", checkIn);

  localStorage.setItem("checkOut", checkOut);

  localStorage.setItem("guests", guests);

  localStorage.setItem("searchPerformed", "true");

  /* =====================================================
       GO TO HOTELS PAGE
    ===================================================== */

  window.location.href = "hotels.html";
}

function selectCity(city) {
  localStorage.setItem("searchLocation", city);

  localStorage.setItem("guests", "1");

  localStorage.setItem("searchPerformed", "true");

  window.location.href = "hotels.html";
}

function useCurrentLocation() {
  const locationInput = document.getElementById("locationInput");

  if (!locationInput) {
    return;
  }

  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser.");

    return;
  }

  locationInput.value = "Detecting location...";

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const latitude = position.coords.latitude;

      const longitude = position.coords.longitude;

      localStorage.setItem("searchLatitude", latitude);

      localStorage.setItem("searchLongitude", longitude);

      /*
       * Demo location.
       *
       * For real GPS → city conversion,
       * use a geocoding API/backend.
       */

      locationInput.value = "India";
    },

    function () {
      locationInput.value = "";

      alert("Unable to detect your location. Please enter a city manually.");
    },
  );
}

function setupHomeFavorites() {
  document.querySelectorAll(".heart-btn").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      const icon = button.querySelector("i");

      if (!icon) {
        return;
      }

      if (icon.classList.contains("bi-heart")) {
        icon.classList.remove("bi-heart");

        icon.classList.add("bi-heart-fill");

        button.classList.add("active");
      } else {
        icon.classList.remove("bi-heart-fill");

        icon.classList.add("bi-heart");

        button.classList.remove("active");
      }
    });
  });
}

function setupDateInputs() {
  const today = new Date().toISOString().split("T")[0];

  const checkIn = document.getElementById("checkIn");

  const checkOut = document.getElementById("checkOut");

  if (checkIn) {
    checkIn.min = today;
  }

  if (checkOut) {
    checkOut.min = today;
  }

  if (checkIn && checkOut) {
    checkIn.addEventListener("change", function () {
      if (checkIn.value) {
        checkOut.min = checkIn.value;

        if (checkOut.value && checkOut.value <= checkIn.value) {
          checkOut.value = "";
        }
      }
    });
  }
}

function initializeHotelsPage() {
  const hotels = document.querySelectorAll(".hotel-item");

  if (hotels.length === 0) {
    return;
  }

  console.log("Aurelia Stays:", hotels.length, "hotels loaded");

  saveOriginalOrder();

  loadSearchData();

  setupFilters();

  setupSort();

  setupListingFavorites();

  updatePrice();

  applyFilters();
}

function saveOriginalOrder() {
  const hotels = document.querySelectorAll(".hotel-item");

  hotels.forEach(function (hotel, index) {
    hotel.dataset.originalOrder = index;
  });
}

function loadSearchData() {
  const location = localStorage.getItem("searchLocation") || "";

  const checkIn = localStorage.getItem("checkIn") || "";

  const checkOut = localStorage.getItem("checkOut") || "";

  const guests = localStorage.getItem("guests") || "1";

  const searchDetails = document.getElementById("searchDetails");

  const searchTitle = document.getElementById("searchTitle");

  /* =====================================================
       SEARCH TITLE
    ===================================================== */

  if (searchTitle && location) {
    searchTitle.innerText = "Hotels in " + location;
  }

  /* =====================================================
       SEARCH DETAILS
    ===================================================== */

  if (!searchDetails) {
    return;
  }

  if (location && checkIn && checkOut) {
    searchDetails.innerText =
      "Hotels in " +
      location +
      " · " +
      formatDate(checkIn) +
      " to " +
      formatDate(checkOut) +
      " · " +
      guests +
      " guest(s)";
  } else if (location) {
    searchDetails.innerText = "Available stays in " + location;
  } else {
    searchDetails.innerText = "Showing available properties across India";
  }
}

function formatDate(dateString) {
  if (!dateString) {
    return "";
  }

  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function setupFilters() {
  const priceRange = document.getElementById("priceRange");

  if (priceRange) {
    priceRange.addEventListener("input", function () {
      updatePrice();

      applyFilters();
    });

    priceRange.addEventListener("change", function () {
      updatePrice();

      applyFilters();
    });
  }

  /* =====================================================
       RATING FILTER
    ===================================================== */

  document.querySelectorAll(".rating-filter").forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      applyFilters();
    });
  });

  /* =====================================================
       PROPERTY TYPE FILTER
    ===================================================== */

  document.querySelectorAll(".type-filter").forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      applyFilters();
    });
  });

  /* =====================================================
       AMENITIES FILTER
    ===================================================== */

  document.querySelectorAll(".amenity-filter").forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      applyFilters();
    });
  });
}

function updatePrice() {
  const priceRange = document.getElementById("priceRange");

  const priceValue = document.getElementById("priceValue");

  if (!priceRange || !priceValue) {
    return;
  }

  const value = Number(priceRange.value);

  priceValue.innerText = CURRENCY + value.toLocaleString("en-IN");
}

function applyFilters() {
  const hotels = Array.from(document.querySelectorAll(".hotel-item"));

  if (hotels.length === 0) {
    return;
  }

  /* =====================================================
       MAX PRICE
    ===================================================== */

  const priceRange = document.getElementById("priceRange");

  const maxPrice = priceRange ? Number(priceRange.value) : Infinity;

  /* =====================================================
       SEARCH LOCATION
    ===================================================== */

  const searchLocation = (localStorage.getItem("searchLocation") || "")
    .trim()
    .toLowerCase();

  /* =====================================================
       SELECTED RATINGS
    ===================================================== */

  const selectedRatings = Array.from(
    document.querySelectorAll(".rating-filter:checked"),
  ).map(function (checkbox) {
    return Number(checkbox.value);
  });

  /* =====================================================
       SELECTED PROPERTY TYPES
    ===================================================== */

  const selectedTypes = Array.from(
    document.querySelectorAll(".type-filter:checked"),
  ).map(function (checkbox) {
    return checkbox.value.trim().toLowerCase();
  });

  /* =====================================================
       SELECTED AMENITIES
    ===================================================== */

  const selectedAmenities = Array.from(
    document.querySelectorAll(".amenity-filter:checked"),
  ).map(function (checkbox) {
    return checkbox.value.trim().toLowerCase();
  });

  let visibleCount = 0;

  /* =====================================================
       CHECK EVERY HOTEL
    ===================================================== */

  hotels.forEach(function (hotel) {
    const price = Number(hotel.dataset.price || 0);

    const rating = Number(hotel.dataset.rating || 0);

    const type = (hotel.dataset.type || "").trim().toLowerCase();

    const location = (hotel.dataset.location || "").trim().toLowerCase();

    const amenities = (hotel.dataset.amenities || "")
      .split(",")
      .map(function (item) {
        return item.trim().toLowerCase();
      })
      .filter(function (item) {
        return item !== "";
      });

    /* =================================================
               PRICE MATCH
            ================================================= */

    const priceMatch = price <= maxPrice;

    /* =================================================
               LOCATION MATCH
            ================================================= */

    let locationMatch = true;

    if (
      searchLocation !== "" &&
      searchLocation !== "nearby hotels" &&
      searchLocation !== "india"
    ) {
      /*
       * Supports:
       *
       * Hyderabad
       * hyderabad
       * Banjara Hills
       * T Nagar
       * Chennai
       *
       * Also checks complete hotel text.
       */

      const hotelText = hotel.innerText.toLowerCase();

      locationMatch =
        location.includes(searchLocation) ||
        searchLocation.includes(location) ||
        hotelText.includes(searchLocation);
    }

    /* =================================================
               RATING MATCH
            ================================================= */

    let ratingMatch = true;

    if (selectedRatings.length > 0) {
      ratingMatch = selectedRatings.some(function (minimumRating) {
        return rating >= minimumRating;
      });
    }

    /* =================================================
               TYPE MATCH
            ================================================= */

    let typeMatch = true;

    if (selectedTypes.length > 0) {
      typeMatch = selectedTypes.includes(type);
    }

    /* =================================================
               AMENITY MATCH
            ================================================= */

    let amenityMatch = true;

    if (selectedAmenities.length > 0) {
      amenityMatch = selectedAmenities.every(function (selectedAmenity) {
        return amenities.includes(selectedAmenity);
      });
    }

    /* =================================================
               FINAL MATCH
            ================================================= */

    const shouldShow =
      priceMatch && locationMatch && ratingMatch && typeMatch && amenityMatch;

    if (shouldShow) {
      hotel.style.display = "";

      visibleCount++;
    } else {
      hotel.style.display = "none";
    }
  });

  /* =====================================================
       HOTEL COUNT
    ===================================================== */

  const hotelCount = document.getElementById("hotelCount");

  if (hotelCount) {
    hotelCount.innerText = visibleCount;
  }

  /* =====================================================
       NO RESULTS
    ===================================================== */

  const noHotelsMessage = document.getElementById("noHotelsMessage");

  if (noHotelsMessage) {
    noHotelsMessage.style.display = visibleCount === 0 ? "block" : "none";
  }

  /* =====================================================
       PAGINATION
    ===================================================== */

  const pagination = document.getElementById("pagination");

  if (pagination) {
    pagination.style.display = visibleCount > 0 ? "block" : "none";
  }
}

function clearFilters() {
  document
    .querySelectorAll(".rating-filter, .type-filter, .amenity-filter")
    .forEach(function (checkbox) {
      checkbox.checked = false;
    });

  /* =====================================================
       RESET PRICE
    ===================================================== */

  const priceRange = document.getElementById("priceRange");

  if (priceRange) {
    priceRange.value = priceRange.max;
  }

  /* =====================================================
       RESET SORT
    ===================================================== */

  const sortHotels = document.getElementById("sortHotels");

  if (sortHotels) {
    sortHotels.value = "recommended";
  }

  /* =====================================================
       CLEAR LOCATION SEARCH
    ===================================================== */

  localStorage.removeItem("searchLocation");

  /* =====================================================
       RESET SEARCH DETAILS
    ===================================================== */

  const searchDetails = document.getElementById("searchDetails");

  if (searchDetails) {
    searchDetails.innerText = "Showing available properties across India";
  }

  updatePrice();

  applyFilters();
}

function setupSort() {
  const sortSelect = document.getElementById("sortHotels");

  if (!sortSelect) {
    return;
  }

  sortSelect.addEventListener("change", function () {
    sortHotels();
  });
}

function sortHotels() {
  const sortSelect = document.getElementById("sortHotels");

  const container = document.getElementById("hotelListContainer");

  if (!sortSelect || !container) {
    return;
  }

  const sortValue = sortSelect.value;

  const hotels = Array.from(container.querySelectorAll(".hotel-item"));

  /* =====================================================
       PRICE LOW
    ===================================================== */

  if (sortValue === "price-low") {
    hotels.sort(function (a, b) {
      return Number(a.dataset.price) - Number(b.dataset.price);
    });
  } else if (sortValue === "price-high") {
    /* =====================================================
       PRICE HIGH
    ===================================================== */
    hotels.sort(function (a, b) {
      return Number(b.dataset.price) - Number(a.dataset.price);
    });
  } else if (sortValue === "rating") {
    /* =====================================================
       RATING
    ===================================================== */
    hotels.sort(function (a, b) {
      return Number(b.dataset.rating) - Number(a.dataset.rating);
    });
  } else {
    /* =====================================================
       RECOMMENDED
    ===================================================== */
    hotels.sort(function (a, b) {
      return Number(a.dataset.originalOrder) - Number(b.dataset.originalOrder);
    });
  }

  /* =====================================================
       PUT HOTELS BACK
    ===================================================== */

  const noHotelsMessage = document.getElementById("noHotelsMessage");

  hotels.forEach(function (hotel) {
    if (noHotelsMessage) {
      container.insertBefore(hotel, noHotelsMessage);
    } else {
      container.appendChild(hotel);
    }
  });

  applyFilters();
}

function setupListingFavorites() {
  document.querySelectorAll(".listing-heart").forEach(function (button) {
    button.addEventListener("click", function (event) {
      event.preventDefault();

      const icon = button.querySelector("i");

      if (!icon) {
        return;
      }

      if (icon.classList.contains("bi-heart")) {
        icon.classList.remove("bi-heart");

        icon.classList.add("bi-heart-fill");

        button.classList.add("active");
      } else {
        icon.classList.remove("bi-heart-fill");

        icon.classList.add("bi-heart");

        button.classList.remove("active");
      }
    });
  });
}

function modifySearch() {
  window.location.href = "index.html";
}
document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);

  const hotelId = urlParams.get("id");

  console.log("Hotel ID:", hotelId);

  if (!hotelId) {
    console.log("No hotel ID found");

    return;
  }

  const hotels = {
    1: {
      name: "Aurelia Grand Hyderabad",

      location: "Banjara Hills, Hyderabad",

      rating: "4.6",

      reviews: "328 Reviews",

      price: "3,499",

      oldPrice: "5,299",

      discount: "35% OFF",

      description:
        "Aurelia Grand Hyderabad offers a comfortable and elegant stay in the heart of Banjara Hills. Guests can enjoy spacious rooms, complimentary Wi-Fi, parking, air conditioning and breakfast. The property is ideal for business travellers, couples and families looking for a convenient stay in Hyderabad.",

      amenities: [
        {
          name: "Free Wi-Fi",
          icon: "bi-wifi",
        },
        {
          name: "Parking",
          icon: "bi-car-front",
        },
        {
          name: "Air Conditioning",
          icon: "bi-snow",
        },
        {
          name: "Breakfast",
          icon: "bi-cup-hot",
        },
        {
          name: "Swimming Pool",
          icon: "bi-water",
        },
      ],

      images: [
        "./images/hotel1.avif",
        "./images/hotel-1.avif",
        "./images/hotel-1-2.avif",
        "./images/hotel-1-3.avif",
        "./images/hotel-1-4.avif",
      ],
    },

    2: {
      name: "Urban Comfort Chennai",

      location: "T. Nagar, Chennai",

      rating: "4.3",

      reviews: "214 Reviews",

      price: "2,199",

      oldPrice: "3,099",

      discount: "28% OFF",

      description:
        "Urban Comfort Chennai is a convenient city hotel located in T. Nagar. It provides comfortable rooms with modern facilities, complimentary Wi-Fi, parking and air conditioning. The property is suitable for business travellers and families visiting Chennai.",

      amenities: [
        {
          name: "Free Wi-Fi",
          icon: "bi-wifi",
        },

        {
          name: "Parking",
          icon: "bi-car-front",
        },

        {
          name: "Air Conditioning",
          icon: "bi-snow",
        },

        {
          name: "Breakfast",
          icon: "bi-cup-hot",
        },

        {
          name: "Room Service",
          icon: "bi-bell",
        },
      ],

      images: [
        "./images/hotel2.avif",
        "./images/hotel-2-1.avif",
        "./images/hotel-2-2.avif",
        "./images/hotel-2-3.avif",
        "./images/hotel-2-5.avif",
      ],
    },
    3: {
      name: "Sunrise Residency Bengaluru",

      location: "Koramangala, Bengaluru",

      rating: "4.8",

      reviews: "421 Reviews",

      price: "2,799",

      oldPrice: "4,799",

      discount: "40% OFF",

      description:
        "Sunrise Residency Bengaluru is a premium resort-style property in Koramangala. The hotel features comfortable rooms, a swimming pool, breakfast, parking, Wi-Fi and air-conditioned rooms. It is a great choice for leisure and business travellers.",

      amenities: [
        {
          name: "Free Wi-Fi",
          icon: "bi-wifi",
        },

        {
          name: "Swimming Pool",
          icon: "bi-water",
        },

        {
          name: "Parking",
          icon: "bi-car-front",
        },

        {
          name: "Breakfast",
          icon: "bi-cup-hot",
        },

        {
          name: "Air Conditioning",
          icon: "bi-snow",
        },
      ],

      images: [
        "./images/hotel3.avif",
        "./images/hotel-3-1.avif",
        "./images/hotel-3-2.avif",
        "./images/hotel-3-3.avif",
        "./images/hotel-3-4.avif",
      ],
    },
    4: {
      name: "Temple View Residency",

      location: "Tirumala Road, Tirupati",

      rating: "4.1",

      reviews: "167 Reviews",

      price: "1,899",

      oldPrice: "2,499",

      discount: "25% OFF",

      description:
        "Temple View Residency provides a convenient and peaceful stay near Tirumala Road in Tirupati. Guests can enjoy comfortable rooms, Wi-Fi, parking and air conditioning. The property is suitable for pilgrims and families visiting Tirupati.",

      amenities: [
        {
          name: "Free Wi-Fi",
          icon: "bi-wifi",
        },

        {
          name: "Parking",
          icon: "bi-car-front",
        },

        {
          name: "Air Conditioning",
          icon: "bi-snow",
        },

        {
          name: "Breakfast",
          icon: "bi-cup-hot",
        },

        {
          name: "24/7 Reception",
          icon: "bi-clock",
        },
      ],

      images: [
        "./images/hotel4.avif",
        "./images/hotel-4-1.avif",
        "./images/hotel-4-2.avif",
        "./images/hotel-4-3.avif",
        "./images/hotel-4-4.avif",
      ],
    },
    5: {
      name: "Royal Plaza Mumbai",

      location: "Andheri West, Mumbai",

      rating: "4.7",

      reviews: "382 Reviews",

      price: "4,299",

      oldPrice: "6,199",

      discount: "30% OFF",

      description:
        "Royal Plaza Mumbai is an upscale city hotel in Andheri West. The property offers modern rooms, a swimming pool, breakfast, complimentary Wi-Fi, parking and air conditioning. It is ideal for travellers looking for a premium Mumbai stay.",

      amenities: [
        {
          name: "Free Wi-Fi",
          icon: "bi-wifi",
        },

        {
          name: "Swimming Pool",
          icon: "bi-water",
        },

        {
          name: "Parking",
          icon: "bi-car-front",
        },

        {
          name: "Breakfast",
          icon: "bi-cup-hot",
        },

        {
          name: "Air Conditioning",
          icon: "bi-snow",
        },
      ],

      images: [
        "./images/hotel5.avif",
        "./images/hotel-5-1.avif",
        "./images/hotel-5-2.avif",
        "./images/hotel-5-3.avif",
        "./images/hotel-5-4.avif",
      ],
    },
    6: {
      name: "Aurelia Beach Resort Goa",

      location: "Calangute Beach, Goa",

      rating: "4.9",

      reviews: "529 Reviews",

      price: "4,999",

      oldPrice: "8,999",

      discount: "45% OFF",

      description:
        "Aurelia Beach Resort Goa offers a premium beachside stay near Calangute Beach. Guests can enjoy a swimming pool, complimentary breakfast, parking, Wi-Fi and air-conditioned rooms. The resort is perfect for couples, families and leisure travellers.",

      amenities: [
        {
          name: "Free Wi-Fi",
          icon: "bi-wifi",
        },

        {
          name: "Swimming Pool",
          icon: "bi-water",
        },

        {
          name: "Parking",
          icon: "bi-car-front",
        },

        {
          name: "Breakfast",
          icon: "bi-cup-hot",
        },

        {
          name: "Air Conditioning",
          icon: "bi-snow",
        },
      ],

      images: [
        "./images/hotel6.avif",
        "./images/hotel-6-1.avif",
        "./images/hotel-6-2.avif",
        "./images/hotel-6-3.avif",
        "./images/hotel-6-4.avif",
      ],
    },
  };

  const hotel = hotels[hotelId];
  if (!hotel) {
    console.log("Hotel not found:", hotelId);

    document.getElementById("hotelName").textContent = "Hotel Not Found";

    return;
  }
  console.log("Selected Hotel:", hotel);
  document.getElementById("hotelName").textContent = hotel.name;

  document.getElementById("hotelLocation").textContent = hotel.location;

  document.getElementById("hotelRating").textContent = hotel.rating;

  document.getElementById("hotelReviews").textContent = hotel.reviews;

  document.getElementById("hotelDescription").textContent = hotel.description;

  document.getElementById("locationText").textContent = hotel.location;

  document.getElementById("hotelPrice").textContent = hotel.price;

  document.getElementById("hotelOldPrice").textContent = "₹" + hotel.oldPrice;

  document.getElementById("hotelDiscount").textContent = hotel.discount;

  let currentImageIndex = 0;

  const mainImage = document.getElementById("mainHotelImage");

  const thumbnailContainer = document.getElementById("thumbnailContainer");

  const imageCounter = document.getElementById("imageCounter");

  function showImage(index) {
    currentImageIndex = index;

    mainImage.src = hotel.images[index];

    imageCounter.textContent = `${index + 1} / ${hotel.images.length}`;

    document.querySelectorAll(".thumbnail").forEach(function (thumbnail, i) {
      thumbnail.classList.toggle("active", i === index);
    });
  }
  thumbnailContainer.innerHTML = "";

  hotel.images.forEach(function (image, index) {
    const thumbnail = document.createElement("img");

    thumbnail.src = image;

    thumbnail.alt = hotel.name + " Image " + (index + 1);

    thumbnail.className = "thumbnail";

    thumbnail.addEventListener("click", function () {
      showImage(index);
    });

    thumbnailContainer.appendChild(thumbnail);
  });
  showImage(0);

  document.getElementById("nextImage").addEventListener("click", function () {
    currentImageIndex++;

    if (currentImageIndex >= hotel.images.length) {
      currentImageIndex = 0;
    }

    showImage(currentImageIndex);
  });

  document.getElementById("prevImage").addEventListener("click", function () {
    currentImageIndex--;

    if (currentImageIndex < 0) {
      currentImageIndex = hotel.images.length - 1;
    }

    showImage(currentImageIndex);
  });

  const amenitiesContainer = document.getElementById("amenitiesContainer");

  amenitiesContainer.innerHTML = "";

  hotel.amenities.forEach(function (amenity) {
    const div = document.createElement("div");

    div.className = "amenity-detail";

    div.innerHTML = `

            <i class="bi ${amenity.icon}"></i>

            <span>
                ${amenity.name}
            </span>

        `;

    amenitiesContainer.appendChild(div);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "ArrowRight") {
      document.getElementById("nextImage").click();
    }

    if (event.key === "ArrowLeft") {
      document.getElementById("prevImage").click();
    }
  });

  window.bookHotel = function () {
    const checkIn = document.getElementById("checkIn").value;

    const checkOut = document.getElementById("checkOut").value;

    if (!checkIn || !checkOut) {
      alert("Please select check-in and check-out dates.");

      return;
    }

    if (checkOut <= checkIn) {
      alert("Check-out date must be after check-in date.");

      return;
    }

    alert(`Booking started for ${hotel.name}`);
  };
});

document.addEventListener("DOMContentLoaded", function () {
  const countdownDate = new Date();

  countdownDate.setDate(countdownDate.getDate() + 2);

  countdownDate.setHours(countdownDate.getHours() + 8);

  function updateCountdown() {
    const now = new Date().getTime();

    const distance = countdownDate.getTime() - now;

    if (distance <= 0) {
      document.getElementById("days").textContent = "00";
      document.getElementById("hours").textContent = "00";
      document.getElementById("minutes").textContent = "00";
      document.getElementById("seconds").textContent = "00";

      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));

    const hours = Math.floor(
      (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
    );

    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    document.getElementById("days").textContent = String(days).padStart(2, "0");

    document.getElementById("hours").textContent = String(hours).padStart(
      2,
      "0",
    );

    document.getElementById("minutes").textContent = String(minutes).padStart(
      2,
      "0",
    );

    document.getElementById("seconds").textContent = String(seconds).padStart(
      2,
      "0",
    );
  }

  updateCountdown();

  setInterval(updateCountdown, 1000);

  /* =====================================================
       COPY OFFER CODE
    ====================================================== */

  const copyButtons = document.querySelectorAll("[data-code]");

  copyButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const code = this.getAttribute("data-code");

      navigator.clipboard
        .writeText(code)
        .then(() => {
          showToast(code + " copied to clipboard!");
        })
        .catch(() => {
          showToast("Offer code: " + code);
        });
    });
  });

  /* =====================================================
       NEWSLETTER SUBSCRIPTION
    ====================================================== */

  const subscribeForm = document.getElementById("offerSubscribeForm");

  if (subscribeForm) {
    subscribeForm.addEventListener("submit", function (event) {
      event.preventDefault();

      const email = document.getElementById("subscribeEmail").value.trim();

      if (email === "") {
        showToast("Please enter your email.");

        return;
      }

      showToast("Thank you! You're subscribed to Aurelia offers.");

      subscribeForm.reset();
    });
  }

  /* =====================================================
       TOAST MESSAGE
    ====================================================== */

  function showToast(message) {
    let toast = document.getElementById("offerToast");

    if (!toast) {
      toast = document.createElement("div");

      toast.id = "offerToast";

      toast.innerHTML = `
                <i class="bi bi-check-circle-fill"></i>
                <span></span>
            `;

      toast.style.position = "fixed";

      toast.style.bottom = "30px";

      toast.style.right = "30px";

      toast.style.background = "#102019";

      toast.style.color = "#ffffff";

      toast.style.padding = "14px 20px";

      toast.style.borderRadius = "12px";

      toast.style.display = "flex";

      toast.style.alignItems = "center";

      toast.style.gap = "10px";

      toast.style.fontSize = "14px";

      toast.style.fontWeight = "600";

      toast.style.zIndex = "99999";

      toast.style.boxShadow = "0 15px 40px rgba(0,0,0,.2)";

      document.body.appendChild(toast);
    }

    toast.querySelector("span").textContent = message;

    toast.style.opacity = "1";

    clearTimeout(toast.hideTimer);

    toast.hideTimer = setTimeout(function () {
      toast.style.opacity = "0";
    }, 3000);
  }

  /* =====================================================
       NAVBAR SHADOW ON SCROLL
    ====================================================== */

  const navbar = document.querySelector(".offers-navbar");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 30) {
      navbar.style.boxShadow = "0 5px 25px rgba(0,0,0,.08)";
    } else {
      navbar.style.boxShadow = "none";
    }
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const progressBars = document.querySelectorAll(".progress-bar");

  const progressObserver = new IntersectionObserver(
    function (entries, observer) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const bar = entry.target;

          const width = bar.getAttribute("data-width");

          bar.style.width = width + "%";

          observer.unobserve(bar);
        }
      });
    },
    {
      threshold: 0.4,
    },
  );

  progressBars.forEach(function (bar) {
    progressObserver.observe(bar);
  });

  /* =====================================================
       REVIEW FILTER
    ===================================================== */

  const filterButtons = document.querySelectorAll(".filter-btn");

  const reviews = document.querySelectorAll(".review-item");

  filterButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      filterButtons.forEach(function (btn) {
        btn.classList.remove("active");
      });

      button.classList.add("active");

      const filter = button.getAttribute("data-filter");

      reviews.forEach(function (review) {
        const rating = parseFloat(review.getAttribute("data-rating"));

        if (filter === "all") {
          review.style.display = "";
        } else {
          const selectedRating = parseInt(filter);

          if (rating >= selectedRating) {
            review.style.display = "";
          } else {
            review.style.display = "none";
          }
        }
      });
    });
  });

  /* =====================================================
       REVIEW SORT
    ===================================================== */

  const sortSelect = document.getElementById("reviewSort");

  const reviewContainer = document.getElementById("reviewsContainer");

  sortSelect.addEventListener("change", function () {
    const items = Array.from(reviewContainer.querySelectorAll(".review-item"));

    const sortType = sortSelect.value;

    items.sort(function (a, b) {
      const ratingA = parseFloat(a.getAttribute("data-rating"));

      const ratingB = parseFloat(b.getAttribute("data-rating"));

      if (sortType === "highest") {
        return ratingB - ratingA;
      }

      if (sortType === "lowest") {
        return ratingA - ratingB;
      }

      return 0;
    });

    items.forEach(function (item) {
      reviewContainer.appendChild(item);
    });
  });

  /* =====================================================
       LOAD MORE REVIEWS
    ===================================================== */

  const loadMoreButton = document.getElementById("loadMoreBtn");

  loadMoreButton.addEventListener("click", function () {
    const hiddenReviews = document.querySelectorAll(
      ".review-item.review-hidden",
    );

    if (hiddenReviews.length > 0) {
      hiddenReviews.forEach(function (review) {
        review.classList.remove("review-hidden");
      });

      loadMoreButton.innerHTML =
        'All Reviews Loaded <i class="bi bi-check-lg"></i>';

      loadMoreButton.disabled = true;
    } else {
      loadMoreButton.innerHTML =
        'More Reviews Coming Soon <i class="bi bi-check-lg"></i>';

      loadMoreButton.disabled = true;
    }
  });

  /* =====================================================
       REVIEW CARD HOVER EFFECT
    ===================================================== */

  const cards = document.querySelectorAll(".review-card");

  cards.forEach(function (card) {
    card.addEventListener("mouseenter", function () {
      card.style.transition = "transform .3s ease, box-shadow .3s ease";
    });
  });

  /* =====================================================
       NAVBAR SCROLL EFFECT
    ===================================================== */

  const navbar = document.querySelector(".reviews-navbar");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 40) {
      navbar.style.boxShadow = "0 8px 25px rgba(20,40,30,.08)";
    } else {
      navbar.style.boxShadow = "none";
    }
  });
});

function openReviewMessage() {
  const modalElement = document.getElementById("reviewMessageModal");

  const modal = new bootstrap.Modal(modalElement);

  modal.show();
}
document.addEventListener("DOMContentLoaded", function () {
  const navbar = document.querySelector(".about-navbar");

  window.addEventListener("scroll", function () {
    if (window.scrollY > 40) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  /* =====================================================
       COUNTER ANIMATION
    ===================================================== */

  const counters = document.querySelectorAll(".counter");

  let counterStarted = false;

  function startCounters() {
    if (counterStarted) {
      return;
    }

    const statsSection = document.querySelector(".stats-section");

    if (!statsSection) {
      return;
    }

    const sectionTop = statsSection.getBoundingClientRect().top;

    if (sectionTop < window.innerHeight - 100) {
      counterStarted = true;

      counters.forEach(function (counter) {
        const target = parseInt(counter.dataset.target);

        let current = 0;

        const increment = Math.max(1, Math.ceil(target / 80));

        const timer = setInterval(function () {
          current += increment;

          if (current >= target) {
            current = target;

            clearInterval(timer);
          }

          if (target >= 1000) {
            counter.textContent = current.toLocaleString() + "+";
          } else {
            counter.textContent = current.toLocaleString();
          }
        }, 25);
      });
    }
  }

  window.addEventListener("scroll", startCounters);

  startCounters();

  /* =====================================================
       NEWSLETTER
    ===================================================== */

  const subscribeBtn = document.getElementById("subscribeBtn");

  const newsletterEmail = document.getElementById("newsletterEmail");

  const subscribeMessage = document.getElementById("subscribeMessage");

  if (subscribeBtn) {
    subscribeBtn.addEventListener("click", function () {
      const email = newsletterEmail.value.trim();

      if (email === "") {
        subscribeMessage.textContent = "Please enter your email address.";

        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailPattern.test(email)) {
        subscribeMessage.textContent = "Please enter a valid email address.";

        return;
      }

      subscribeMessage.textContent = "Thank you! You're now subscribed.";

      newsletterEmail.value = "";
    });
  }

  /* =====================================================
       SMOOTH SCROLL
    ===================================================== */

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (event) {
      const targetId = this.getAttribute("href");

      if (targetId === "#" || !targetId) {
        return;
      }

      const target = document.querySelector(targetId);

      if (target) {
        event.preventDefault();

        const navbarHeight =
          document.querySelector(".about-navbar").offsetHeight;

        const position =
          target.getBoundingClientRect().top +
          window.pageYOffset -
          navbarHeight -
          15;

        window.scrollTo({
          top: position,

          behavior: "smooth",
        });
      }
    });
  });

  /* =====================================================
       VALUE CARD REVEAL
    ===================================================== */

  const revealElements = document.querySelectorAll(
    ".value-card, .why-box, .story-point",
  );

  const revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");

          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
    },
  );

  revealElements.forEach(function (element) {
    element.style.opacity = "0";

    element.style.transform = "translateY(25px)";

    element.style.transition = "opacity 0.6s ease, transform 0.6s ease";

    revealObserver.observe(element);
  });

  /* =====================================================
       ADD REVEALED STYLE DYNAMICALLY
    ===================================================== */

  const revealStyle = document.createElement("style");

  revealStyle.innerHTML = `

        .value-card.revealed,
        .why-box.revealed,
        .story-point.revealed {

            opacity: 1 !important;

            transform: translateY(0) !important;

        }

    `;

  document.head.appendChild(revealStyle);
});

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  const email = document.getElementById("email");

  const password = document.getElementById("password");

  const remember = document.getElementById("remember");

  const passwordToggle = document.getElementById("passwordToggle");

  const loginButton = document.getElementById("loginButton");

  const loginButtonText = document.getElementById("loginButtonText");

  const loginMessage = document.getElementById("loginMessage");

  const forgotPassword = document.getElementById("forgotPassword");

  const googleButton = document.getElementById("googleButton");

  /* =================================================
       PASSWORD SHOW / HIDE
    ================================================= */

  if (passwordToggle) {
    passwordToggle.addEventListener("click", function () {
      if (password.type === "password") {
        password.type = "text";

        passwordToggle.innerHTML = '<i class="bi bi-eye-slash"></i>';

        passwordToggle.setAttribute("aria-label", "Hide password");
      } else {
        password.type = "password";

        passwordToggle.innerHTML = '<i class="bi bi-eye"></i>';

        passwordToggle.setAttribute("aria-label", "Show password");
      }
    });
  }

  /* =================================================
       EMAIL VALIDATION
    ================================================= */

  function validateEmail() {
    const value = email.value.trim();

    const error = document.getElementById("emailError");

    const wrapper = email.closest(".input-wrapper");

    if (value === "") {
      error.textContent = "Please enter your email address.";

      wrapper.classList.add("error");

      return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(value)) {
      error.textContent = "Please enter a valid email address.";

      wrapper.classList.add("error");

      return false;
    }

    error.textContent = "";

    wrapper.classList.remove("error");

    return true;
  }

  /* =================================================
       PASSWORD VALIDATION
    ================================================= */

  function validatePassword() {
    const value = password.value;

    const error = document.getElementById("passwordError");

    const wrapper = password.closest(".input-wrapper");

    if (value === "") {
      error.textContent = "Please enter your password.";

      wrapper.classList.add("error");

      return false;
    }

    if (value.length < 6) {
      error.textContent = "Password must contain at least 6 characters.";

      wrapper.classList.add("error");

      return false;
    }

    error.textContent = "";

    wrapper.classList.remove("error");

    return true;
  }

  /* =================================================
       LIVE VALIDATION
    ================================================= */

  email.addEventListener("blur", validateEmail);

  password.addEventListener("blur", validatePassword);

  email.addEventListener("input", function () {
    if (email.value.trim() !== "") {
      validateEmail();
    }
  });

  password.addEventListener("input", function () {
    if (password.value !== "") {
      validatePassword();
    }
  });

  /* =================================================
       LOGIN FORM
    ================================================= */

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    loginMessage.innerHTML = "";

    const validEmail = validateEmail();

    const validPassword = validatePassword();

    if (!validEmail || !validPassword) {
      return;
    }

    /* -----------------------------------------
               LOADING STATE
            ----------------------------------------- */

    loginButton.classList.add("loading");

    loginButtonText.textContent = "Signing in...";

    /* -----------------------------------------
               DEMO LOGIN
               
               Replace this section with your PHP/API
               authentication later.
            ----------------------------------------- */

    setTimeout(function () {
      const userEmail = email.value.trim();

      /*
       * Demo credentials:
       *
       * Email:
       * demo@aureliastays.com
       *
       * Password:
       * 123456
       */

      if (
        userEmail === "demo@aureliastays.com" &&
        password.value === "123456"
      ) {
        /* Remember login */

        if (remember.checked) {
          localStorage.setItem("aureliaRemember", "true");

          localStorage.setItem("aureliaUser", userEmail);
        }

        showMessage("Login successful. Redirecting...", "success");

        loginButtonText.textContent = "Success ✓";

        setTimeout(function () {
          window.location.href = "index.html";
        }, 1000);
      } else {
        loginButton.classList.remove("loading");

        loginButtonText.textContent = "Sign in";

        showMessage(
          "Incorrect email or password. Please check your details and try again.",
          "error",
        );
      }
    }, 1200);
  });

  /* =================================================
       MESSAGE FUNCTION
    ================================================= */

  function showMessage(message, type) {
    loginMessage.innerHTML = `

            <div class="login-alert ${type}">

                <i class="bi ${
                  type === "success"
                    ? "bi-check-circle"
                    : "bi-exclamation-circle"
                }"></i>

                ${message}

            </div>

        `;
  }

  /* =================================================
       FORGOT PASSWORD
    ================================================= */

  forgotPassword.addEventListener("click", function (event) {
    event.preventDefault();

    const modalElement = document.getElementById("forgotModal");

    const modal = new bootstrap.Modal(modalElement);

    const currentEmail = email.value.trim();

    if (currentEmail !== "") {
      document.getElementById("resetEmail").value = currentEmail;
    }

    modal.show();
  });

  /* =================================================
       RESET PASSWORD
    ================================================= */

  const resetButton = document.getElementById("resetButton");

  resetButton.addEventListener("click", function () {
    const resetEmail = document.getElementById("resetEmail");

    const resetMessage = document.getElementById("resetMessage");

    const value = resetEmail.value.trim();

    if (value === "") {
      resetMessage.innerHTML = `

                    <div class="login-alert error mt-3">

                        Please enter your email address.

                    </div>

                `;

      return;
    }

    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!pattern.test(value)) {
      resetMessage.innerHTML = `

                    <div class="login-alert error mt-3">

                        Please enter a valid email address.

                    </div>

                `;

      return;
    }

    resetButton.disabled = true;

    resetButton.textContent = "Sending...";

    setTimeout(function () {
      resetButton.disabled = false;

      resetButton.textContent = "Send reset instructions";

      resetMessage.innerHTML = `

                    <div class="login-alert success mt-3">

                        <i class="bi bi-check-circle"></i>

                        Password reset instructions have been
                        sent to your email.

                    </div>

                `;
    }, 1000);
  });

  /* =================================================
       GOOGLE LOGIN
    ================================================= */

  googleButton.addEventListener("click", function () {
    showMessage("Google authentication will be available soon.", "success");
  });

  /* =================================================
       LOAD REMEMBERED EMAIL
    ================================================= */

  const remembered = localStorage.getItem("aureliaRemember");

  const rememberedUser = localStorage.getItem("aureliaUser");

  if (remembered === "true" && rememberedUser) {
    email.value = rememberedUser;

    remember.checked = true;
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("signupForm");

  const name = document.getElementById("name");

  const email = document.getElementById("email");

  const phone = document.getElementById("phone");

  const password = document.getElementById("password");

  const terms = document.getElementById("terms");

  const passwordToggle = document.getElementById("passwordToggle");

  const signupButton = document.getElementById("signupButton");

  const signupButtonText = document.getElementById("signupButtonText");

  const message = document.getElementById("signupMessage");

  /* =============================================
           PASSWORD SHOW / HIDE
        ============================================= */

  passwordToggle.addEventListener("click", function () {
    if (password.type === "password") {
      password.type = "text";

      passwordToggle.innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
      password.type = "password";

      passwordToggle.innerHTML = '<i class="bi bi-eye"></i>';
    }
  });

  /* =============================================
           ERROR FUNCTION
        ============================================= */

  function setError(input, errorId, text) {
    const wrapper = input.closest(".input-box");

    const error = document.getElementById(errorId);

    if (text) {
      wrapper.classList.add("invalid");

      error.textContent = text;

      return false;
    }

    wrapper.classList.remove("invalid");

    error.textContent = "";

    return true;
  }

  /* =============================================
           NAME VALIDATION
        ============================================= */

  function validateName() {
    const value = name.value.trim();

    if (value === "") {
      return setError(name, "nameError", "Please enter your full name.");
    }

    if (value.length < 3) {
      return setError(
        name,
        "nameError",
        "Name must contain at least 3 characters.",
      );
    }

    return setError(name, "nameError", "");
  }

  /* =============================================
           EMAIL VALIDATION
        ============================================= */

  function validateEmail() {
    const value = email.value.trim();

    if (value === "") {
      return setError(email, "emailError", "Please enter your email.");
    }

    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!pattern.test(value)) {
      return setError(
        email,
        "emailError",
        "Please enter a valid email address.",
      );
    }

    return setError(email, "emailError", "");
  }

  /* =============================================
           PHONE VALIDATION
        ============================================= */

  function validatePhone() {
    const value = phone.value.replace(/\D/g, "");

    if (value === "") {
      return setError(phone, "phoneError", "Please enter your mobile number.");
    }

    if (value.length < 10 || value.length > 15) {
      return setError(
        phone,
        "phoneError",
        "Please enter a valid mobile number.",
      );
    }

    return setError(phone, "phoneError", "");
  }

  /* =============================================
           PASSWORD RULES
        ============================================= */

  function checkPassword() {
    const value = password.value;

    const lengthRule = document.getElementById("lengthRule");

    const numberRule = document.getElementById("numberRule");

    const letterRule = document.getElementById("letterRule");

    const hasLength = value.length >= 8;

    const hasNumber = /\d/.test(value);

    const hasLetter = /[A-Za-z]/.test(value);

    updateRule(lengthRule, hasLength);

    updateRule(numberRule, hasNumber);

    updateRule(letterRule, hasLetter);

    const bars = document.querySelectorAll(".strength-bar span");

    let strength = 0;

    if (hasLength) strength++;

    if (hasNumber) strength++;

    if (hasLetter) strength++;

    if (value.length >= 12 && /[!@#$%^&*]/.test(value)) {
      strength++;
    }

    bars.forEach(function (bar, index) {
      if (index < strength) {
        bar.style.background = "#157347";
      } else {
        bar.style.background = "#e4e9e5";
      }
    });

    const strengthText = document.getElementById("passwordStrength");

    if (value === "") {
      strengthText.textContent = "Strong password recommended";

      strengthText.style.color = "#9aa39d";
    } else if (strength <= 1) {
      strengthText.textContent = "Weak password";

      strengthText.style.color = "#dc3545";
    } else if (strength === 2) {
      strengthText.textContent = "Good password";

      strengthText.style.color = "#c58a00";
    } else {
      strengthText.textContent = "Strong password";

      strengthText.style.color = "#157347";
    }

    return hasLength && hasNumber && hasLetter;
  }

  /* =============================================
           UPDATE PASSWORD RULE
        ============================================= */

  function updateRule(element, valid) {
    if (valid) {
      element.classList.add("valid");
    } else {
      element.classList.remove("valid");
    }
  }

  /* =============================================
           PASSWORD VALIDATION
        ============================================= */

  function validatePassword() {
    const valid = checkPassword();

    const error = document.getElementById("passwordError");

    if (password.value === "") {
      error.textContent = "Please create a password.";

      return false;
    }

    if (!valid) {
      error.textContent =
        "Password must contain 8+ characters, one letter and one number.";

      return false;
    }

    error.textContent = "";

    return true;
  }

  /* =========================================
   AURELIA STAYS - TERMS PAGE JS
========================================= */

  document.addEventListener("DOMContentLoaded", function () {
    /* =====================================
       SIDEBAR ACTIVE SECTION
    ===================================== */

    const sections = document.querySelectorAll(".terms-block");

    const links = document.querySelectorAll(".sidebar-link");

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");

            links.forEach(function (link) {
              link.classList.remove("active");
            });

            const activeLink = document.querySelector(
              '.sidebar-link[href="#' + id + '"]',
            );

            if (activeLink) {
              activeLink.classList.add("active");
            }
          }
        });
      },
      {
        rootMargin: "-120px 0px -60% 0px",
        threshold: 0,
      },
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });

    /* =====================================
       SIDEBAR SMOOTH SCROLL
    ===================================== */

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        const targetId = this.getAttribute("href");

        const target = document.querySelector(targetId);

        if (target) {
          event.preventDefault();

          const navbarHeight = 90;

          const position =
            target.getBoundingClientRect().top + window.scrollY - navbarHeight;

          window.scrollTo({
            top: position,

            behavior: "smooth",
          });
        }
      });
    });

    /* =====================================
       NAVBAR SHADOW ON SCROLL
    ===================================== */

    const navbar = document.querySelector(".terms-navbar");

    window.addEventListener("scroll", function () {
      if (window.scrollY > 20) {
        navbar.style.boxShadow = "0 8px 25px rgba(20,40,30,.06)";
      } else {
        navbar.style.boxShadow = "none";
      }
    });

    /* =====================================
       REVEAL TERMS SECTIONS
    ===================================== */

    const revealItems = document.querySelectorAll(".terms-block");

    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.08,
      },
    );

    revealItems.forEach(function (item) {
      item.style.opacity = "0";
      item.style.transform = "translateY(20px)";
      item.style.transition = "opacity .6s ease, transform .6s ease";

      revealObserver.observe(item);
    });
  });
  /* =====================================================
   AURELIA STAYS - CONTACT PAGE JAVASCRIPT
===================================================== */

  document.addEventListener("DOMContentLoaded", function () {
    /* =================================================
       CONTACT FORM
    ================================================= */

    const contactForm = document.getElementById("contactForm");

    const formMessage = document.getElementById("formMessage");

    const messageInput = document.getElementById("message");

    const charCount = document.getElementById("charCount");

    /* =================================================
       CHARACTER COUNTER
    ================================================= */

    if (messageInput && charCount) {
      messageInput.addEventListener("input", function () {
        let length = this.value.length;

        if (length > 500) {
          this.value = this.value.substring(0, 500);

          length = 500;
        }

        charCount.textContent = length;
      });
    }

    /* =================================================
       FORM SUBMIT
    ================================================= */

    if (contactForm) {
      contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();

        const email = document.getElementById("email").value.trim();

        const phone = document.getElementById("phone").value.trim();

        const subject = document.getElementById("subject").value;

        const message = document.getElementById("message").value.trim();

        /* -----------------------------------------
               VALIDATION
            ----------------------------------------- */

        if (!name || !email || !phone || !subject || !message) {
          showMessage("Please complete all required fields.", "error");

          return;
        }

        /* -----------------------------------------
               EMAIL VALIDATION
            ----------------------------------------- */

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
          showMessage("Please enter a valid email address.", "error");

          return;
        }

        /* -----------------------------------------
               PHONE VALIDATION
            ----------------------------------------- */

        const phoneDigits = phone.replace(/\D/g, "");

        if (phoneDigits.length < 10) {
          showMessage("Please enter a valid phone number.", "error");

          return;
        }

        /* -----------------------------------------
               MESSAGE LENGTH
            ----------------------------------------- */

        if (message.length < 10) {
          showMessage(
            "Please provide a little more detail in your message.",
            "error",
          );

          return;
        }

        /* -----------------------------------------
               SUCCESS
            ----------------------------------------- */

        showMessage(
          "Thank you, " +
            name +
            "! Your message has been received. Our support team will contact you shortly.",
          "success",
        );

        /* -----------------------------------------
               RESET FORM
            ----------------------------------------- */

        contactForm.reset();

        if (charCount) {
          charCount.textContent = "0";
        }

        /* -----------------------------------------
               SCROLL TO MESSAGE
            ----------------------------------------- */

        setTimeout(function () {
          formMessage.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      });
    }

    /* =================================================
       MESSAGE FUNCTION
    ================================================= */

    function showMessage(text, type) {
      if (!formMessage) {
        return;
      }

      if (type === "success") {
        formMessage.innerHTML = `
                <div class="form-success">
                    <i class="bi bi-check-circle me-2"></i>
                    ${text}
                </div>
            `;
      } else {
        formMessage.innerHTML = `
                <div class="form-error">
                    <i class="bi bi-exclamation-circle me-2"></i>
                    ${text}
                </div>
            `;
      }

      setTimeout(function () {
        formMessage.innerHTML = "";
      }, 6000);
    }

    /* =================================================
       NAVBAR SCROLL EFFECT
    ================================================= */

    const navbar = document.querySelector(".contact-navbar");

    window.addEventListener("scroll", function () {
      if (!navbar) {
        return;
      }

      if (window.scrollY > 30) {
        navbar.style.boxShadow = "0 8px 25px rgba(20, 50, 35, 0.07)";
      } else {
        navbar.style.boxShadow = "none";
      }
    });

    /* =================================================
       FAQ ICON
    ================================================= */

    const faqButtons = document.querySelectorAll(".faq-question");

    faqButtons.forEach(function (button) {
      button.addEventListener("click", function () {
        faqButtons.forEach(function (otherButton) {
          if (otherButton !== button) {
            otherButton.classList.add("collapsed");
          }
        });
      });
    });

    /* =================================================
       PHONE NUMBER CLICK
    ================================================= */

    const phoneLinks = document.querySelectorAll('a[href^="tel:"]');

    phoneLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        console.log("Calling Aurelia Stays support...");
      });
    });

    /* =================================================
       FADE-IN ANIMATION
    ================================================= */

    const animatedItems = document.querySelectorAll(
      ".contact-option, .help-item, .message-card, .office-card",
    );

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";

            entry.target.style.transform = "translateY(0)";

            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      },
    );

    animatedItems.forEach(function (item) {
      item.style.opacity = "0";

      item.style.transform = "translateY(20px)";

      item.style.transition = "opacity 0.6s ease, transform 0.6s ease";

      observer.observe(item);
    });
  });

  /* =========================================
   AURELIA STAYS - TERMS PAGE JS
========================================= */

  document.addEventListener("DOMContentLoaded", function () {
    /* =====================================
       SIDEBAR ACTIVE SECTION
    ===================================== */

    const sections = document.querySelectorAll(".terms-block");

    const links = document.querySelectorAll(".sidebar-link");

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");

            links.forEach(function (link) {
              link.classList.remove("active");
            });

            const activeLink = document.querySelector(
              '.sidebar-link[href="#' + id + '"]',
            );

            if (activeLink) {
              activeLink.classList.add("active");
            }
          }
        });
      },
      {
        rootMargin: "-120px 0px -60% 0px",
        threshold: 0,
      },
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });

    /* =====================================
       SIDEBAR SMOOTH SCROLL
    ===================================== */

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        const targetId = this.getAttribute("href");

        const target = document.querySelector(targetId);

        if (target) {
          event.preventDefault();

          const navbarHeight = 90;

          const position =
            target.getBoundingClientRect().top + window.scrollY - navbarHeight;

          window.scrollTo({
            top: position,

            behavior: "smooth",
          });
        }
      });
    });

    /* =====================================
       NAVBAR SHADOW ON SCROLL
    ===================================== */

    const navbar = document.querySelector(".terms-navbar");

    window.addEventListener("scroll", function () {
      if (window.scrollY > 20) {
        navbar.style.boxShadow = "0 8px 25px rgba(20,40,30,.06)";
      } else {
        navbar.style.boxShadow = "none";
      }
    });

    /* =====================================
       REVEAL TERMS SECTIONS
    ===================================== */

    const revealItems = document.querySelectorAll(".terms-block");

    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      {
        threshold: 0.08,
      },
    );

    revealItems.forEach(function (item) {
      item.style.opacity = "0";
      item.style.transform = "translateY(20px)";
      item.style.transition = "opacity .6s ease, transform .6s ease";

      revealObserver.observe(item);
    });
  });

  document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("destinationSearch");

    const searchButton = document.getElementById("searchDestination");

    const destinationItems = document.querySelectorAll(".destination-item");

    const noDestination = document.getElementById("noDestination");

    function searchDestinations() {
      const searchValue = searchInput.value.trim().toLowerCase();

      let found = false;

      destinationItems.forEach(function (item) {
        const destinationName = item.dataset.name.toLowerCase();

        if (searchValue === "" || destinationName.includes(searchValue)) {
          item.classList.remove("d-none");

          found = true;
        } else {
          item.classList.add("d-none");
        }
      });

      if (found) {
        noDestination.classList.add("d-none");
      } else {
        noDestination.classList.remove("d-none");
      }
    }

    searchButton.addEventListener("click", searchDestinations);

    searchInput.addEventListener("keyup", function (event) {
      if (event.key === "Enter") {
        searchDestinations();
      }
    });

    searchInput.addEventListener("input", function () {
      if (this.value.trim() === "") {
        destinationItems.forEach(function (item) {
          item.classList.remove("d-none");
        });

        noDestination.classList.add("d-none");
      }
    });

    /* =================================================
       SMOOTH SCROLL
    ================================================= */

    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        const targetId = this.getAttribute("href");

        if (targetId !== "#" && document.querySelector(targetId)) {
          event.preventDefault();

          document.querySelector(targetId).scrollIntoView({
            behavior: "smooth",
          });
        }
      });
    });
  });

  document.addEventListener("DOMContentLoaded", function () {
    const links = document.querySelectorAll(".privacy-link");

    const sections = document.querySelectorAll(".privacy-block");

    /* ================================
       SIDEBAR ACTIVE LINK
    ================================= */

    window.addEventListener("scroll", function () {
      let currentSection = "";

      sections.forEach(function (section) {
        const sectionTop = section.offsetTop - 140;

        if (window.scrollY >= sectionTop) {
          currentSection = section.getAttribute("id");
        }
      });

      links.forEach(function (link) {
        link.classList.remove("active");

        if (link.getAttribute("href") === "#" + currentSection) {
          link.classList.add("active");
        }
      });
    });

    /* ================================
       SMOOTH SCROLL
    ================================= */

    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();

        const targetId = this.getAttribute("href");

        const target = document.querySelector(targetId);

        if (target) {
          window.scrollTo({
            top: target.offsetTop - 90,

            behavior: "smooth",
          });
        }
      });
    });

    /* ================================
       CONTACT BUTTON
    ================================= */

    const contactButton = document.querySelector(".privacy-contact .btn");

    if (contactButton) {
      contactButton.addEventListener("click", function () {
        this.innerHTML =
          'Contact Support <i class="bi bi-arrow-right ms-2"></i>';
      });
    }
  });

  document.addEventListener("DOMContentLoaded", function () {
    /* =====================================================
       PAYMENT METHOD
    ===================================================== */

    const paymentCards = document.querySelectorAll(".payment-card");

    paymentCards.forEach(function (card) {
      card.addEventListener("click", function () {
        paymentCards.forEach(function (item) {
          item.classList.remove("active");
        });

        card.classList.add("active");

        const radio = card.querySelector("input[type='radio']");

        if (radio) {
          radio.checked = true;
        }
      });
    });

    /* =====================================================
       BOOKING FORM
    ===================================================== */

    const bookingForm = document.getElementById("bookingForm");

    const bookingMessage = document.getElementById("bookingMessage");

    if (bookingForm) {
      bookingForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const firstName = document.getElementById("firstName").value.trim();

        const lastName = document.getElementById("lastName").value.trim();

        const email = document.getElementById("email").value.trim();

        const phone = document.getElementById("phone").value.trim();

        const terms = document.getElementById("bookingTerms").checked;

        if (
          firstName === "" ||
          lastName === "" ||
          email === "" ||
          phone === ""
        ) {
          showMessage("Please complete all required guest details.", "error");

          return;
        }

        if (!terms) {
          showMessage(
            "Please accept the booking terms before continuing.",
            "error",
          );

          return;
        }

        /* BUTTON LOADING */

        const button = bookingForm.querySelector(".confirm-btn");

        const originalHTML = button.innerHTML;

        button.disabled = true;

        button.innerHTML = `
                <span>Processing booking...</span>
                <i class="bi bi-arrow-repeat"></i>
            `;

        setTimeout(function () {
          button.disabled = false;

          button.innerHTML = originalHTML;

          showMessage(
            "Booking details accepted. Your reservation confirmation is ready.",
            "success",
          );

          /* Update progress */

          const progressSteps = document.querySelectorAll(".progress-step");

          if (progressSteps.length >= 3) {
            progressSteps[0].classList.remove("active");

            progressSteps[1].classList.add("active");
          }
        }, 1500);
      });
    }

    /* =====================================================
       MESSAGE
    ===================================================== */

    function showMessage(message, type) {
      if (!bookingMessage) {
        return;
      }

      if (type === "success") {
        bookingMessage.innerHTML = `
                <div class="booking-success">
                    <i class="bi bi-check-circle-fill me-2"></i>
                    ${message}
                </div>
            `;
      } else {
        bookingMessage.innerHTML = `
                <div class="alert alert-danger mt-3 mb-0">
                    <i class="bi bi-exclamation-circle me-2"></i>
                    ${message}
                </div>
            `;
      }

      bookingMessage.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    /* =====================================================
       CHANGE ROOM
    ===================================================== */

    const changeRoom = document.querySelector(".change-room");

    if (changeRoom) {
      changeRoom.addEventListener("click", function () {
        window.location.href = "hotel-details.html";
      });
    }

    /* =====================================================
       PREVENT DOUBLE CLICK
    ===================================================== */

    let bookingSubmitted = false;

    if (bookingForm) {
      bookingForm.addEventListener("submit", function () {
        if (bookingSubmitted) {
          return;
        }

        bookingSubmitted = true;
      });
    }
  });
});
