import axios from 'axios';
const TYPE_WEIGHT = {
    "Placement": 3,
    "Result": 2,
    "Event": 1
};
async function getTopNotifications(limit = 10, token = "DUMMY_TOKEN") {
    try {
        const response = await axios.get('http://20.207.122.201/evaluation-service/notifications', {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        let notifications = response.data.notifications;
        notifications.sort((a, b) => {
            if (TYPE_WEIGHT[a.Type] !== TYPE_WEIGHT[b.Type]) {
                return TYPE_WEIGHT[b.Type] - TYPE_WEIGHT[a.Type];
            }
            else {
                return new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime();
            }
        });
        const topN = notifications.slice(0, limit);
        console.log(`Top ${limit} Notifications:`);
        console.table(topN);
    }
    catch (error) {
        console.error("Failed to fetch notifications:");
        if (error.response) {
            console.error(error.response.status, error.response.data);
        }
        else {
            console.error(error.message);
        }
    }
}
// Replace DUMMY_TOKEN with your actual token
getTopNotifications(10, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJubm50ZWplc2hAZ21haWwuY29tIiwiZXhwIjoxNzc4MDU5MTE1LCJpYXQiOjE3NzgwNTgyMTUsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiI5ZmFhNWJmOS0wOGNmLTQxOWQtYTZiZC1kZDNkN2JmNDc0ZjciLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJuZWVsYW0gbmFnYSBuYXJlbiB0ZWplc2giLCJzdWIiOiJjMWI1OWQ4Zi1lMjVjLTRhNWQtOTc1Zi1hOWNiZTZjZjhkNmYifSwiZW1haWwiOiJubm50ZWplc2hAZ21haWwuY29tIiwibmFtZSI6Im5lZWxhbSBuYWdhIG5hcmVuIHRlamVzaCIsInJvbGxObyI6ImNiLnNjLnU0Y3NlMjMwNDIiLCJhY2Nlc3NDb2RlIjoiUFRCTW1RIiwiY2xpZW50SUQiOiJjMWI1OWQ4Zi1lMjVjLTRhNWQtOTc1Zi1hOWNiZTZjZjhkNmYiLCJjbGllbnRTZWNyZXQiOiJoS1BSVG5GZ1dHUHVwZnR4In0.XOAZ2drkeMR7egDmrkrq1KPU6HnFJLpLZGaijcArmi8");
