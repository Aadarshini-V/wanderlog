const tripForm = document.getElementById("trip-form");
const tripList = document.getElementById("trip-list");
const emptyMessage = document.getElementById("empty-message");

// Get trips from localStorage
let trips = JSON.parse(localStorage.getItem("trips")) || [];

// Display trips
function displayTrips() {
    tripList.innerHTML = "";

    if (trips.length === 0) {
        tripList.innerHTML = "<p>No trips added yet.</p>";
        return;
    }

    trips.forEach(function (trip) {
        const tripCard = document.createElement("div");

        tripCard.className = "trip-card";

        tripCard.innerHTML = `
            <h3>${trip.title}</h3>
            <p><strong>Destination:</strong> ${trip.destination}</p>
            <p><strong>Date:</strong> ${trip.date}</p>
            <p><strong>Notes:</strong> ${trip.notes || "No notes"}</p>
        `;

        tripList.appendChild(tripCard);
    });
}

// Add new trip
tripForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const title = document.getElementById("trip-title").value.trim();
    const destination = document.getElementById("trip-destination").value.trim();
    const date = document.getElementById("trip-date").value;
    const notes = document.getElementById("trip-notes").value.trim();

    if (!title || !destination || !date) {
        alert("Please fill in all required fields.");
        return;
    }

    const newTrip = {
        id: Date.now(),
        title: title,
        destination: destination,
        date: date,
        notes: notes
    };

    trips.push(newTrip);

    // Save to localStorage
    localStorage.setItem("trips", JSON.stringify(trips));

    // Clear form
    tripForm.reset();

    // Display updated trips
    displayTrips();
});

// Display saved trips when page loads
displayTrips();
