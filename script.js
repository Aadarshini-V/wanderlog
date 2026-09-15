"use strict";


/* ================= SETTINGS ================= */

const STORAGE_KEY = "wanderlogTrips";

const DEFAULT_IMAGE =
"https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1000&q=80";


let trips = [];

let toastTimer;


/* ================= START ================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);


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

    renderTrips();

    setupProfile();

}


/* ================= STORAGE ================= */

function loadTrips() {

    try {

        const saved =
            localStorage.getItem(
                STORAGE_KEY
            );

        if (!saved) {

            return [];

        }

        const parsed =
            JSON.parse(saved);

        if (!Array.isArray(parsed)) {

            return [];

        }

        return parsed;

    }

    catch (error) {

        console.error(
            "Error loading trips:",
            error
        );

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

    }

    catch (error) {

        console.error(
            "Error saving trips:",
            error
        );

        showToast(
            "Unable to save trip."
        );

        return false;

    }

}


/* ================= YEAR ================= */

function setYear() {

    const year =
        document.getElementById(
            "year"
        );

    if (year) {

        year.textContent =
            new Date().getFullYear();

    }

}


/* ================= ESCAPE HTML ================= */

function escapeHTML(value) {

    return String(value || "")
        .replace(
            /[&<>"']/g,
            function(character) {

                const entities = {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"

                };

                return entities[character];

            }
        );

}


/* ================= DATE ================= */

function formatDate(dateString) {

    if (!dateString) {

        return "Date not set";

    }

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return "Date not set";

    }

    return new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    ).format(date);

}


/* ================= UPCOMING ================= */

function isUpcoming(dateString) {

    if (!dateString) {

        return false;

    }

    const today =
        new Date();

    today.setHours(
        0,
        0,
        0,
        0
    );

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    return date >= today;

}


/* ================= TOAST ================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );

    if (!toast) return;

    toast.textContent =
        message;

    toast.classList.add(
        "show"
    );

    clearTimeout(
        toastTimer
    );

    toastTimer =
        setTimeout(
            function() {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* ================= NAVIGATION ================= */

function setupNavigation() {

    const toggle =
        document.getElementById(
            "menu-toggle"
        );

    const nav =
        document.getElementById(
            "nav-links"
        );

    if (toggle && nav) {

        toggle.addEventListener(
            "click",
            function() {

                const opened =
                    nav.classList.toggle(
                        "open"
                    );

                toggle.setAttribute(
                    "aria-expanded",
                    opened
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
        .querySelectorAll(
            "#nav-links a"
        )
        .forEach(
            function(link) {

                link.addEventListener(
                    "click",
                    function() {

                        nav?.classList.remove(
                            "open"
                        );

                        toggle?.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            }
        );

}


/* ================= FORM ================= */

function setupForm() {

    const form =
        document.getElementById(
            "trip-form"
        );

    if (!form) return;


    form.addEventListener(
        "submit",
        handleSubmit
    );


    document
        .getElementById(
            "cancel-btn"
        )
        ?.addEventListener(
            "click",
            resetForm
        );


    document
        .getElementById(
            "trip-notes"
        )
        ?.addEventListener(
            "input",
            function(event) {

                document
                    .getElementById(
                        "notes-count"
                    )
                    .textContent =
                    event.target.value.length;

            }
        );

}


function validateForm() {

    clearErrors();

    let valid = true;


    const title =
        document.getElementById(
            "trip-title"
        );

    const destination =
        document.getElementById(
            "trip-destination"
        );

    const date =
        document.getElementById(
            "trip-date"
        );

    const image =
        document.getElementById(
            "trip-image"
        );


    if (!title.value.trim()) {

        showFieldError(
            title,
            "title-error",
            "Please enter a trip title."
        );

        valid = false;

    }


    if (!destination.value.trim()) {

        showFieldError(
            destination,
            "destination-error",
            "Please enter a destination."
        );

        valid = false;

    }


    if (!date.value) {

        showFieldError(
            date,
            "date-error",
            "Please choose a travel date."
        );

        valid = false;

    }


    if (image.value.trim()) {

        try {

            const url =
                new URL(
                    image.value.trim()
                );

            if (
                url.protocol !== "http:" &&
                url.protocol !== "https:"
            ) {

                throw new Error();

            }

        }

        catch {

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

    input.classList.add(
        "invalid"
    );

    document
        .getElementById(
            errorId
        )
        .textContent =
        message;

}


function clearErrors() {

    document
        .querySelectorAll(
            ".field-error"
        )
        .forEach(
            element =>
                element.textContent = ""
        );

    document
        .querySelectorAll(
            "#trip-form input"
        )
        .forEach(
            input =>
                input.classList.remove(
                    "invalid"
                )
        );

}


function showFormMessage(
    message,
    type
) {

    const box =
        document.getElementById(
            "form-message"
        );

    if (!box) return;

    box.textContent =
        message;

    box.className =
        "form-message " + type;

}


/* ================= ADD / UPDATE ================= */

function handleSubmit(event) {

    event.preventDefault();


    if (!validateForm()) {

        return;

    }


    const editId =
        document.getElementById(
            "edit-id"
        ).value;


    const title =
        document.getElementById(
            "trip-title"
        ).value.trim();


    const destination =
        document.getElementById(
            "trip-destination"
        ).value.trim();


    const date =
        document.getElementById(
            "trip-date"
        ).value;


    const image =
        document.getElementById(
            "trip-image"
        ).value.trim();


    const notes =
        document.getElementById(
            "trip-notes"
        ).value.trim();


    const id =
        editId ||
        Date.now().toString();


    const trip = {

        id: id,

        title: title,

        destination: destination,

        date: date,

        image:
            image || DEFAULT_IMAGE,

        notes: notes

    };


    if (editId) {

        const index =
            trips.findIndex(
                trip =>
                    trip.id === editId
            );

        if (index !== -1) {

            trips[index] =
                trip;

        }

        showToast(
            "Trip updated successfully!"
        );

    }

    else {

        trips.push(
            trip
        );

        showToast(
            "Trip saved successfully!"
        );

    }


    if (!saveTrips()) {

        return;

    }


    renderTrips();

    resetForm();


    document
        .getElementById(
            "my-trips"
        )
        ?.scrollIntoView({
            behavior: "smooth"
        });

}


/* ================= RESET FORM ================= */

function resetForm() {

    const form =
        document.getElementById(
            "trip-form"
        );

    if (!form) return;


    form.reset();


    document
        .getElementById(
            "edit-id"
        ).value = "";


    document
        .getElementById(
            "submit-text"
        ).textContent =
        "Save trip";


    document
        .getElementById(
            "notes-count"
        ).textContent =
        "0";


    clearErrors();


    showFormMessage(
        "",
        ""
    );

}


/* ================= RENDER TRIPS ================= */

function renderTrips(
    searchText = ""
) {

    const list =
        document.getElementById(
            "trip-list"
        );

    if (!list) return;


    const search =
        searchText
            .trim()
            .toLowerCase();


    const filtered =
        trips
            .filter(
                trip => {

                    return (
                        !search ||

                        trip.title
                            .toLowerCase()
                            .includes(search) ||

                        trip.destination
                            .toLowerCase()
                            .includes(search)
                    );

                }
            )
            .sort(
                (a, b) =>
                    a.date.localeCompare(
                        b.date
                    )
            );


    list.innerHTML = "";


    const empty =
        document.getElementById(
            "empty-message"
        );


    const noResults =
        document.getElementById(
            "no-results"
        );


    if (trips.length === 0) {

        empty?.classList.remove(
            "hidden"
        );

        noResults?.classList.add(
            "hidden"
        );

    }

    else if (
        filtered.length === 0
    ) {

        empty?.classList.add(
            "hidden"
        );

        noResults?.classList.remove(
            "hidden"
        );

    }

    else {

        empty?.classList.add(
            "hidden"
        );

        noResults?.classList.add(
            "hidden"
        );

    }


    filtered.forEach(
        function(trip) {

            const card =
                document.createElement(
                    "article"
                );

            card.className =
                "trip-card";


            card.innerHTML = `

                <div class="trip-card-image">

                    <img
                        src="${escapeHTML(trip.image)}"
                        alt="${escapeHTML(trip.title)} cover image">

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
                        ${escapeHTML(trip.title)}
                    </h3>


                    <p class="destination">
                        ${escapeHTML(trip.destination)}
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
                            data-id="${trip.id}">
                            View
                        </button>


                        <button
                            type="button"
                            data-action="edit"
                            data-id="${trip.id}">
                            Edit
                        </button>


                        <button
                            type="button"
                            class="danger"
                            data-action="delete"
                            data-id="${trip.id}">
                            Delete
                        </button>

                    </div>

                </div>
            `;


            const image =
                card.querySelector(
                    "img"
                );


            image.addEventListener(
                "error",
                function() {

                    image.src =
                        DEFAULT_IMAGE;

                },
                { once: true }
            );


            list.appendChild(
                card
            );

        }
    );


    updateTripCount();

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
        document.getElementById(
            "trip-list"
        );

    if (!list) return;


    list.addEventListener(
        "click",
        function(event) {

            const button =
                event.target.closest(
                    "button[data-action]"
                );

            if (!button) return;


            const id =
                button.dataset.id;


            const trip =
                trips.find(
                    item =>
                        item.id === id
                );


            if (!trip) return;


            if (
                button.dataset.action ===
                "view"
            ) {

                openModal(trip);

            }


            if (
                button.dataset.action ===
                "edit"
            ) {

                editTrip(trip);

            }


            if (
                button.dataset.action ===
                "delete"
            ) {

                deleteTrip(trip);

            }

        }
    );

}


/* ================= EDIT ================= */

function editTrip(trip) {

    document
        .getElementById(
            "edit-id"
        ).value =
        trip.id;


    document
        .getElementById(
            "trip-title"
        ).value =
        trip.title;


    document
        .getElementById(
            "trip-destination"
        ).value =
        trip.destination;


    document
        .getElementById(
            "trip-date"
        ).value =
        trip.date;


    document
        .getElementById(
            "trip-image"
        ).value =
        trip.image || "";


    document
        .getElementById(
            "trip-notes"
        ).value =
        trip.notes || "";


    document
        .getElementById(
            "notes-count"
        ).textContent =
        (trip.notes || "").length;


    document
        .getElementById(
            "submit-text"
        ).textContent =
        "Update trip";


    clearErrors();


    showFormMessage(
        "You are editing this trip.",
        "success"
    );


    document
        .getElementById(
            "add-trip"
        )
        ?.scrollIntoView({
            behavior: "smooth"
        });


    document
        .getElementById(
            "trip-title"
        )
        ?.focus();

}


/* ================= DELETE ================= */

function deleteTrip(trip) {

    const confirmed =
        confirm(
            `Delete "${trip.title}"?`
        );


    if (!confirmed) {

        return;

    }


    trips =
        trips.filter(
            item =>
                item.id !== trip.id
        );


    if (!saveTrips()) {

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


    search?.addEventListener(
        "input",
        function() {

            renderTrips(
                search.value
            );

        }
    );


    clear?.addEventListener(
        "click",
        function() {

            search.value = "";

            renderTrips();

            search.focus();

        }
    );

}


/* ================= DESTINATION BUTTON ================= */

function setupDestinationButtons() {

    document
        .querySelectorAll(
            ".destination-plan"
        )
        .forEach(
            function(button) {

                button.addEventListener(
                    "click",
                    function() {

                        const destination =
                            button.dataset.destination;


                        const field =
                            document.getElementById(
                                "trip-destination");


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
                                behavior:
                                    "smooth"
                            });


                        showToast(
                            destination +
                            " selected."
                        );

                    }
                );

            }
        );

            }
/* ================= MODAL ================= */

function setupModal() {

    document
        .querySelectorAll(
            "[data-close-modal]"
        )
        .forEach(
            function(element) {

                element.addEventListener(
                    "click",
                    closeModal
                );

            }
        );


    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key === "Escape"
            ) {

                closeModal();

            }

        }
    );

}


function openModal(trip) {

    const modal =
        document.getElementById(
            "trip-modal"
        );


    if (!modal) return;


    const image =
        document.getElementById(
            "modal-image"
        );


    image.src =
        trip.image ||
        DEFAULT_IMAGE;


    image.alt =
        trip.title +
        " cover image";


    image.onerror =
        function() {

            image.src =
                DEFAULT_IMAGE;

        };


    document
        .getElementById(
            "modal-date"
        )
        .textContent =
        formatDate(
            trip.date
        );


    document
        .getElementById(
            "modal-title"
        )
        .textContent =
        trip.title;


    document
        .getElementById(
            "modal-destination"
        )
        .textContent =
        trip.destination;


    document
        .getElementById(
            "modal-notes"
        )
        .textContent =
        trip.notes ||
        "No notes were added.";


    modal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";


    document
        .querySelector(
            ".modal-close"
        )
        ?.focus();

}


function closeModal() {

    const modal =
        document.getElementById(
            "trip-modal"
        );


    if (!modal) return;


    modal.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";

}


/* ================= IMAGE FALLBACK ================= */

function setupImageFallback() {

    document
        .querySelectorAll(
            "img"
        )
        .forEach(
            function(image) {

                image.addEventListener(
                    "error",
                    function() {

                        if (
                            image.dataset.fallback
                        ) {

                            return;

                        }

                        image.dataset.fallback =
                            "true";

                        image.src =
                            DEFAULT_IMAGE;

                    }
                );

            }
        );

}


/* ================= PROFILE ================= */

function setupProfile() {

    const total =
        document.getElementById(
            "profile-trip-count"
        );


    if (!total) return;


    const destinationCount =
        new Set(
            trips.map(
                trip =>
                    trip.destination
                        .trim()
                        .toLowerCase()
            )
        ).size;


    const upcoming =
        trips.filter(
            trip =>
                isUpcoming(
                    trip.date
                )
        ).length;


    const notes =
        trips.filter(
            trip =>
                trip.notes &&
                trip.notes.trim()
        ).length;


    total.textContent =
        trips.length;


    document
        .getElementById(
            "profile-destination-count"
        ).textContent =
        destinationCount;


    document
        .getElementById(
            "profile-upcoming-count"
        ).textContent =
        upcoming;


    document
        .getElementById(
            "profile-note-count"
        ).textContent =
        notes;

}


        
