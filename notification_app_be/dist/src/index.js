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
getTopNotifications(10, "YOUR_ACCESS_TOKEN_HERE");
