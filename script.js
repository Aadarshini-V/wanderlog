const tripForm = document.getElementById("trip-form");
const tripList = document.getElementById("trip-list");

const formHeading = document.getElementById("form-heading");
const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");

const titleInput = document.getElementById("trip-title");
const destinationInput = document.getElementById("trip-destination");
const dateInput = document.getElementById("trip-date");
const notesInput = document.getElementById("trip-notes");

// Get trips from localStorage
let trips = JSON.parse(localStorage.getItem("trips")) || [];

// Track which trip is being edited
let editingTripId = null;


// Save trips to localStorage
function saveTrips() {
    localStorage.setItem("trips", JSON.stringify(trips));
}


// Display trips
function displayTrips() {
    tripList.innerHTML = "";

    if (trips.length === 0) {
        const emptyMessage = document.createElement("p");
        emptyMessage.textContent = "No trips added yet.";
        tripList.appendChild(emptyMessage);
        return;
    }

    trips.forEach(function (trip) {
        const tripCard = document.createElement("div");
        tripCard.className = "trip-card";

        const title = document.createElement("h3");
        title.textContent = trip.title;

        const destination = document.createElement("p");
        destination.innerHTML = "<strong>Destination:</strong> ";
        destination.append(trip.destination);

        const date = document.createElement("p");
        date.innerHTML = "<strong>Date:</strong> ";
        date.append(formatDate(trip.date));

        const notes = document.createElement("p");
        notes.innerHTML = "<strong>Notes:</strong> ";
        notes.append(trip.notes || "No notes");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.addEventListener("click", function () {
            editTrip(trip.id);
        });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", function () {
            deleteTrip(trip.id);
        });

        tripCard.appendChild(title);
        tripCard.appendChild(destination);
        tripCard.appendChild(date);
        tripCard.appendChild(notes);
        tripCard.appendChild(editButton);
        tripCard.appendChild(deleteButton);

        tripList.appendChild(tripCard);
    });
}


// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString + "T00:00:00");

    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


// Add or update trip
tripForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const destination = destinationInput.value.trim();
    const date = dateInput.value;
    const notes = notesInput.value.trim();

    // Validation
    if (!title || !destination || !date) {
        alert("Please fill in all required fields.");
        return;
    }

    // UPDATE existing trip
    if (editingTripId !== null) {
        const trip = trips.find(function (trip) {
            return trip.id === editingTripId;
        });

        if (trip) {
            trip.title = title;
            trip.destination = destination;
            trip.date = date;
            trip.notes = notes;

            alert("Trip updated successfully!");
        }

        editingTripId = null;
    }

    // CREATE new trip
    else {
        const newTrip = {
            id: Date.now(),
            title: title,
            destination: destination,
            date: date,
            notes: notes
        };

        trips.push(newTrip);

        alert("Trip added successfully!");
    }

    saveTrips();
    displayTrips();
    resetForm();
});


// Edit trip
function editTrip(id) {
    const trip = trips.find(function (trip) {
        return trip.id === id;
    });

    if (!trip) return;

    editingTripId = id;

    titleInput.value = trip.title;
    destinationInput.value = trip.destination;
    dateInput.value = trip.date;
    notesInput.value = trip.notes;

    formHeading.textContent = "Edit Trip";
    submitBtn.textContent = "Update Trip";
    cancelBtn.style.display = "inline-block";

    // Scroll to form
    document.getElementById("add-trip").scrollIntoView({
        behavior: "smooth"
    });
}


// Delete trip
function deleteTrip(id) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this trip?"
    );

    if (!confirmDelete) return;

    trips = trips.filter(function (trip) {
        return trip.id !== id;
    });

    saveTrips();
    displayTrips();

    alert("Trip deleted successfully!");
}


// Reset form
function resetForm() {
    tripForm.reset();

    editingTripId = null;

    formHeading.textContent = "Add a New Trip";
    submitBtn.textContent = "Add Trip";
    cancelBtn.style.display = "none";
}


// Cancel editing
cancelBtn.addEventListener("click", function () {
    resetForm();
});


// Display saved trips when page loads
displayTrips();

// Hide cancel button initially
cancelBtn.style.display = "none";
