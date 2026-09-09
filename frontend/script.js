const API_URL = "http://13.127.155.244:3000";

// ===============================
// Check Backend
// ===============================

async function checkBackend() {

    try {

        const response = await fetch(
            `${API_URL}/api/health`
        );

        const data = await response.json();

        console.log("Backend:", data);

    } catch (error) {

        console.error(
            "Backend connection failed:",
            error
        );

    }
}

checkBackend();

// ===============================
// Appointment Booking
// ===============================

const form = document.getElementById("appointmentForm");

if (form) {

    form.addEventListener("submit", async function (event) {

        event.preventDefault();

        const patientName =
            document.getElementById("patientName").value;

        const doctorName =
            document.getElementById("doctorName").value;

        const department =
            document.getElementById("department").value;

        const appointmentDate =
            document.getElementById("appointmentDate").value;

        const appointmentTime =
            document.getElementById("appointmentTime").value;

        try {

            const response = await fetch(
                `${API_URL}/api/appointments`,
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        patientName: patientName,

                        doctorName: doctorName,

                        department: department,

                        appointmentDate: appointmentDate,

                        appointmentTime: appointmentTime

                    })
                }
            );

            const data = await response.json();

            console.log("Server response:", data);

            if (response.ok) {

                alert(
                    "Appointment booked successfully!"
                );

                form.reset();

            } else {

                alert(
                    data.message ||
                    "Failed to book appointment"
                );

            }

        } catch (error) {

            console.error(
                "Backend connection error:",
                error
            );

            alert(
                "Cannot connect to hospital backend"
            );

        }

    });

}