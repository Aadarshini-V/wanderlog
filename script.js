"use strict";

/* ================= SETTINGS ================= */

const STORAGE_KEY = "wanderlogTrips";

const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=80";

let trips = [];
let toastTimer;


/* ================= START ================= */

document.addEventListener("DOMContentLoaded", initialize);


function initialize() {

    trips = loadTrips();

    setYear();
    setupNavigation();
    setupForm();
    setupTripActions();
    setupSearch();
    setupDestinationButtons();
    setupModal();
    setupImageFallback();
    setupProfile();

    renderTrips();

}


/* ================= STORAGE ================= */

function loadTrips() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);

        if (!Array.isArray(parsed)) {
            return [];
        }

        return parsed;

    } catch (error) {

        console.error("Error loading trips:", error);

        return [];

    }

}


function saveTrips() {

    try {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(trips)
        );

        return true;

    } catch (error) {

        console.error("Error saving trips:", error);

        showToast("Unable to save trip.");

        return false;

    }

}


/* ================= YEAR ================= */

function setYear() {

    const year = document.getElementById("year");

    if (year) {
        year.textContent = new Date().getFullYear();
    }

}


/* ================= ESCAPE HTML ================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/[&<>"']/g, function(character) {

            const entities = {

                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"

            };

            return entities[character];

        });

}


/* ================= DATE ================= */

function formatDate(dateString) {

    if (!dateString) {
        return "Date not set";
    }

    const date = new Date(dateString + "T00:00:00");

    if (Number.isNaN(date.getTime())) {
        return "Date not set";
    }

    return new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
    }).format(date);

}


/* ================= UPCOMING ================= */

function isUpcoming(dateString) {

    if (!dateString) {
        return false;
    }

    const today = new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    const date = new Date(
        dateString + "T00:00:00"
    );

    return date >= today;

}


/* ================= TOAST ================= */

function showToast(message) {

    const toast = document.getElementById("toast");

    if (!toast) {
        return;
    }

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(function() {

        toast.classList.remove("show");

    }, 2500);

}


/* ================= NAVIGATION ================= */

function setupNavigation() {

    const toggle =
        document.getElementById("menu-toggle");

    const nav =
        document.getElementById("nav-links");

    if (toggle && nav) {

        toggle.addEventListener(
            "click",
            function() {

                const opened =
                    nav.classList.toggle("open");

                toggle.setAttribute(
                    "aria-expanded",
                    String(opened)
                );

                toggle.setAttribute(
                    "aria-label",
                    opened
                        ? "Close navigation menu"
                        : "Open navigation menu"
                );

            }
        );

    }


    document
        .querySelectorAll("#nav-links a")
        .forEach(function(link) {

            link.addEventListener(
                "click",
                function() {

                    nav?.classList.remove("open");

                    toggle?.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                    toggle?.setAttribute(
                        "aria-label",
                        "Open navigation menu"
                    );

                }
            );

        });

}


/* ================= FORM ================= */

function setupForm() {

    const form =
        document.getElementById("trip-form");

    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        handleSubmit
    );


    const cancelButton =
        document.getElementById("cancel-btn");

    if (cancelButton) {

        cancelButton.addEventListener(
            "click",
            resetForm
        );

    }


    const notes =
        document.getElementById("trip-notes");

    const notesCount =
        document.getElementById("notes-count");


    if (notes && notesCount) {

        notes.addEventListener(
            "input",
            function(event) {

                notesCount.textContent =
                    event.target.value.length;

            }
        );

    }

}


/* ================= VALIDATION ================= */

function validateForm() {

    clearErrors();

    let valid = true;


    const title =
        document.getElementById("trip-title");

    const destination =
        document.getElementById("trip-destination");

    const date =
        document.getElementById("trip-date");

    const image =
        document.getElementById("trip-image");


    if (!title || !title.value.trim()) {

        if (title) {

            showFieldError(
                title,
                "title-error",
                "Please enter a trip title."
            );

        }

        valid = false;

    }


    if (
        !destination ||
        !destination.value.trim()
    ) {

        if (destination) {

            showFieldError(
                destination,
                "destination-error",
                "Please enter a destination."
            );

        }

        valid = false;

    }


    if (!date || !date.value) {

        if (date) {

            showFieldError(
                date,
                "date-error",
                "Please choose a travel date."
            );

        }

        valid = false;

    }


    if (image && image.value.trim()) {

        try {

            const url =
                new URL(
                    image.value.trim()
                );

            if (
                url.protocol !== "http:" &&
                url.protocol !== "https:"
            ) {

                throw new Error(
                    "Invalid protocol"
                );

            }

        } catch (error) {

            showFieldError(
                image,
                "image-error",
                "Enter a valid image URL."
            );

            valid = false;

        }

    }


    if (!valid) {

        showFormMessage(
            "Please correct the highlighted fields.",
            "error"
        );

    }


    return valid;

}


function showFieldError(
    input,
    errorId,
    message
) {

    input.classList.add("invalid");

    const errorElement =
        document.getElementById(errorId);

    if (errorElement) {

        errorElement.textContent =
            message;

    }

}


function clearErrors() {

    document
        .querySelectorAll(".field-error")
        .forEach(function(element) {

            element.textContent = "";

        });


    document
        .querySelectorAll("#trip-form input, #trip-form textarea")
        .forEach(function(input) {

            input.classList.remove("invalid");

        });

}


function showFormMessage(
    message,
    type
) {

    const box =
        document.getElementById("form-message");

    if (!box) {
        return;
    }

    box.textContent = message;

    box.className =
        type
            ? "form-message " + type
            : "form-message";

}


/* ================= ADD / UPDATE ================= */

function handleSubmit(event) {

    event.preventDefault();


    if (!validateForm()) {
        return;
    }


    const editInput =
        document.getElementById("edit-id");

    const titleInput =
        document.getElementById("trip-title");

    const destinationInput =
        document.getElementById("trip-destination");

    const dateInput =
        document.getElementById("trip-date");

    const imageInput =
        document.getElementById("trip-image");

    const notesInput =
        document.getElementById("trip-notes");


    const editId =
        editInput?.value || "";


    const title =
        titleInput.value.trim();


    const destination =
        destinationInput.value.trim();


    const date =
        dateInput.value;


    const image =
        imageInput?.value.trim() || "";


    const notes =
        notesInput?.value.trim() || "";


    const id =
        editId ||
        Date.now().toString();


    const trip = {

        id: id,

        title: title,

        destination: destination,

        date: date,

        image: image || DEFAULT_IMAGE,

        notes: notes

    };


    if (editId) {

        const index =
            trips.findIndex(function(item) {

                return item.id === editId;

            });


        if (index !== -1) {

            trips[index] = trip;

            if (saveTrips()) {

                renderTrips();

                resetForm();

                showToast(
                    "Trip updated successfully!"
                );

            }

            return;

        }

    }


    trips.push(trip);


    if (saveTrips()) {

        renderTrips();

        resetForm();

        showToast(
            "Trip saved successfully!"
        );


        document
            .getElementById("my-trips")
            ?.scrollIntoView({
                behavior: "smooth"
            });

    }

}


/* ================= RESET FORM ================= */

function resetForm() {

    const form =
        document.getElementById("trip-form");

    if (!form) {
        return;
    }


    form.reset();


    const editId =
        document.getElementById("edit-id");

    if (editId) {
        editId.value = "";
    }


    const submitText =
        document.getElementById("submit-text");

    if (submitText) {

        submitText.textContent =
            "Save trip";

    }


    const notesCount =
        document.getElementById("notes-count");

    if (notesCount) {

        notesCount.textContent =
            "0";

    }


    clearErrors();

    showFormMessage("", "");

}


/* ================= RENDER TRIPS ================= */

function renderTrips(searchText = "") {

    const list =
        document.getElementById("trip-list");

    if (!list) {
        return;
    }


    const search =
        searchText.trim().toLowerCase();


    const filtered =
        trips
            .filter(function(trip) {

                const title =
                    String(trip.title || "")
                        .toLowerCase();

                const destination =
                    String(trip.destination || "")
                        .toLowerCase();

                return (
                    !search ||
                    title.includes(search) ||
                    destination.includes(search)
                );

            })
            .sort(function(a, b) {

                return String(a.date || "")
                    .localeCompare(
                        String(b.date || "")
                    );

            });


    list.innerHTML = "";


    const empty =
        document.getElementById("empty-message");

    const noResults =
        document.getElementById("no-results");


    if (trips.length === 0) {

        empty?.classList.remove("hidden");

        noResults?.classList.add("hidden");

    } else if (filtered.length === 0) {

        empty?.classList.add("hidden");

        noResults?.classList.remove("hidden");

    } else {

        empty?.classList.add("hidden");

        noResults?.classList.add("hidden");

    }


    filtered.forEach(function(trip) {

        const card =
            document.createElement("article");

        card.className =
            "trip-card";


        card.innerHTML = `

            <div class="trip-card-image">

                <img
                    src="${escapeHTML(
                        trip.image || DEFAULT_IMAGE
                    )}"
                    alt="${escapeHTML(
                        trip.title || "Trip"
                    )} cover image">

                <span class="trip-date-badge">
                    ${escapeHTML(
                        formatDate(trip.date)
                    )}
                </span>

            </div>


            <div class="trip-card-body">

                <span class="card-tag">

                    ${
                        isUpcoming(trip.date)
                            ? "Upcoming"
                            : "Past trip"
                    }

                </span>


                <h3>
                    ${escapeHTML(
                        trip.title
                    )}
                </h3>


                <p class="destination">
                    ${escapeHTML(
                        trip.destination
                    )}
                </p>


                <p class="trip-notes">

                    ${
                        escapeHTML(
                            trip.notes ||
                            "No notes added."
                        )
                    }

                </p>


                <div class="trip-actions">

                    <button
                        type="button"
                        data-action="view"
                        data-id="${escapeHTML(trip.id)}">

                        View

                    </button>


                    <button
                        type="button"
                        data-action="edit"
                        data-id="${escapeHTML(trip.id)}">

                        Edit

                    </button>


                    <button
                        type="button"
                        class="danger"
                        data-action="delete"
                        data-id="${escapeHTML(trip.id)}">

                        Delete

                    </button>

                </div>

            </div>

        `;


        const image =
            card.querySelector("img");


        if (image) {

            image.addEventListener(
                "error",
                function() {

                    image.src =
                        DEFAULT_IMAGE;

                },
                { once: true }
            );

        }


        list.appendChild(card);

    });


    updateTripCount();

    updateProfileStats();

}


/* ================= COUNT ================= */

function updateTripCount() {

    const count =
        document.getElementById(
            "hero-trip-count"
        );


    const summary =
        document.getElementById(
            "trip-summary"
        );


    if (count) {

        count.textContent =
            trips.length;

    }


    if (summary) {

        summary.textContent =
            `${trips.length} ${
                trips.length === 1
                    ? "trip"
                    : "trips"
            } saved`;

    }

}


/* ================= TRIP ACTIONS ================= */

function setupTripActions() {

    const list =
        document.getElementById("trip-list");

    if (!list) {
        return;
    }


    list.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    "button[data-action]"
                );


            if (!button) {
                return;
            }


            const id =
                button.dataset.id;


            const trip =
                trips.find(function(item) {

                    return String(item.id) === String(id);

                });


            if (!trip) {
                return;
            }


            const action =
                button.dataset.action;


            if (action === "view") {

                openModal(trip);

            }


            if (action === "edit") {

                editTrip(trip);

            }


            if (action === "delete") {

                deleteTrip(trip);

            }

        }
    );

}


/* ================= EDIT ================= */

function editTrip(trip) {

    const editId =
        document.getElementById("edit-id");

    const title =
        document.getElementById("trip-title");

    const destination =
        document.getElementById("trip-destination");

    const date =
        document.getElementById("trip-date");

    const image =
        document.getElementById("trip-image");

    const notes =
        document.getElementById("trip-notes");

    const notesCount =
        document.getElementById("notes-count");

    const submitText =
        document.getElementById("submit-text");


    if (editId) {
        editId.value = trip.id;
    }


    if (title) {
        title.value = trip.title || "";
    }


    if (destination) {
        destination.value =
            trip.destination || "";
    }


    if (date) {
        date.value = trip.date || "";
    }


    if (image) {

        image.value =
            trip.image === DEFAULT_IMAGE
                ? ""
                : (trip.image || "");

    }


    if (notes) {
        notes.value = trip.notes || "";
    }


    if (notesCount) {

        notesCount.textContent =
            (trip.notes || "").length;

    }


    if (submitText) {

        submitText.textContent =
            "Update trip";

    }


    clearErrors();


    showFormMessage(
        "You are editing this trip.",
        "success"
    );


    document
        .getElementById("add-trip")
        ?.scrollIntoView({
            behavior: "smooth"
        });


    title?.focus();

}


/* ================= DELETE ================= */

function deleteTrip(trip) {

    const confirmed =
        window.confirm(
            `Delete "${trip.title}"?`
        );


    if (!confirmed) {
        return;
    }


    const oldTrips =
        trips;


    trips =
        trips.filter(function(item) {

            return String(item.id) !==
                String(trip.id);

        });


    if (!saveTrips()) {

        trips = oldTrips;

        return;

    }


    renderTrips();

    showToast(
        "Trip deleted."
    );

}


/* ================= SEARCH ================= */

function setupSearch() {

    const search =
        document.getElementById(
            "trip-search"
        );


    const clear =
        document.getElementById(
            "clear-search"
        );


    if (search) {

        search.addEventListener(
            "input",
            function() {

                renderTrips(
                    search.value
                );

            }
        );

    }


    if (clear) {

        clear.addEventListener(
            "click",
            function() {

                if (search) {

                    search.value = "";

                    search.focus();

                }

                renderTrips();

            }
        );

    }

}


/* ================= DESTINATION BUTTONS ================= */

function setupDestinationButtons() {

    document
        .querySelectorAll(
            ".destination-plan"
        )
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

                    const destination =
                        button.dataset.destination;


                    const field =
                        document.getElementById(
                            "trip-destination"
                        );


                    if (field) {

                        field.value =
                            destination;

                        field.focus();

                    }


                    document
                        .getElementById(
                            "add-trip"
                        )
                        ?.scrollIntoView({
                            behavior: "smooth"
                        });


                    showToast(
                        destination +
                        " selected."
                    );

                }
            );

        });

}


/* ================= MODAL ================= */

function setupModal() {

    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(function(element) {

            element.addEventListener(
                "click",
                closeModal
            );

        });


    document.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Escape") {

                closeModal();

            }

        }
    );

}


/* ================= OPEN MODAL ================= */

function openModal(trip) {

    const modal =
        document.getElementById(
            "trip-modal"
        );


    if (!modal) {
        return;
    }


    const image =
        document.getElementById(
            "modal-image"
        );


    if (image) {

        image.src =
            trip.image ||
            DEFAULT_IMAGE;

        image.alt =
            `${trip.title || "Trip"} cover image`;

        image.onerror =
            function() {

                image.onerror = null;

                image.src =
                    DEFAULT_IMAGE;

            };

    }


    const modalDate =
        document.getElementById(
            "modal-date"
        );


    const modalTitle =
        document.getElementById(
            "modal-title"
        );


    const modalDestination =
        document.getElementById(
            "modal-destination"
        );


    const modalNotes =
        document.getElementById(
            "modal-notes"
        );


    if (modalDate) {

        modalDate.textContent =
            formatDate(trip.date);

    }


    if (modalTitle) {

        modalTitle.textContent =
            trip.title || "";

    }


    if (modalDestination) {

        modalDestination.textContent =
            trip.destination || "";

    }


    if (modalNotes) {

        modalNotes.textContent =
            trip.notes ||
            "No notes were added.";

    }


    modal.classList.remove("hidden");

    document.body.style.overflow =
        "hidden";


    document
        .querySelector(".modal-close")
        ?.focus();

}


/* ================= CLOSE MODAL ================= */

function closeModal() {

    const modal =
        document.getElementById(
            "trip-modal"
        );


    if (!modal) {
        return;
    }


    modal.classList.add("hidden");

    document.body.style.overflow = "";

}


/* ================= IMAGE FALLBACK ================= */

function setupImageFallback() {

    document
        .querySelectorAll("img")
        .forEach(function(image) {

            image.addEventListener(
                "error",
                function() {

                    if (
                        image.dataset.fallback === "true"
                    ) {

                        return;

                    }


                    image.dataset.fallback =
                        "true";


                    image.src =
                        DEFAULT_IMAGE;

                }
            );

        });

}


/* ================= PROFILE ================= */

function setupProfile() {

    updateProfileStats();

}


function updateProfileStats() {

    const total =
        document.getElementById(
            "profile-trip-count"
        );


    const destinationCount =
        document.getElementById(
            "profile-destination-count"
        );


    const upcoming =
        document.getElementById(
            "profile-upcoming-count"
        );


    const notes =
        document.getElementById(
            "profile-note-count"
        );


    if (
        !total &&
        !destinationCount &&
        !upcoming &&
        !notes
    ) {

        return;

    }


    const destinations =
        new Set();


    trips.forEach(function(trip) {

        const destination =
            String(
                trip.destination || ""
            )
            .trim()
            .toLowerCase();


        if (destination) {

            destinations.add(
                destination
            );

        }

    });


    const upcomingCount =
        trips.filter(function(trip) {

            return isUpcoming(trip.date);

        }).length;


    const notesCount =
        trips.filter(function(trip) {

            return (
                trip.notes &&
                String(trip.notes).trim()
            );

        }).length;


    if (total) {

        total.textContent =
            trips.length;

    }


    if (destinationCount) {

        destinationCount.textContent =
            destinations.size;

    }


    if (upcoming) {

        upcoming.textContent =
            upcomingCount;

    }


    if (notes) {

        notes.textContent =
            notesCount;

    }

}
