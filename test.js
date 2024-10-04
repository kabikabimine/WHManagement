const moment = require('moment');
const axios = require('axios');

const totalPeople = 9; // Tổng số người
let myPosition = 9; // Vị trí của bạn
let startDate = moment('2024-10-08'); // Ngày bạn phải gửi từ tiếng Anh

const telegramToken = '7797981830:AAFKv1SrdaXnDM2M-njrUOzSILR0J74P27o'; // Thay thế bằng token của bạn
const chatId = '1873755848'; // Thay thế bằng ID người nhận
const weatherApiKey = 'bee715bd545c79e933d92c8b46937735'; // Thay thế bằng API key từ OpenWeatherMap
const location = 'Danang,VN'; // Địa điểm của bạn (VD: Hanoi, VN)

// Hàm gửi thông báo qua Telegram
async function sendTelegramMessage(message) {
    const url = `https://api.telegram.org/bot${telegramToken}/sendMessage`;
    try {
        await axios.post(url, {
            chat_id: chatId,
            text: message
        });
        console.log('Thông báo đã được gửi qua Telegram');
    } catch (error) {
        console.error('Lỗi khi gửi thông báo:', error);
    }
}

// Hàm tính toán ngày gửi tiếp theo
function calculateNextDate(currentDate) {
    let nextDate = currentDate.clone().add(totalPeople, 'days'); // Thêm số ngày bằng số người
    // Bỏ qua thứ 7 và chủ nhật
    while (nextDate.isoWeekday() > 5) {
        nextDate.add(1, 'days'); // Nếu là thứ 7 hoặc chủ nhật, thêm một ngày
    }
    return nextDate;
}

// Kiểm tra ngày hôm nay có phải là ngày bạn gửi không
function isTodayReminderDay() {
    const today = moment(); // Lấy ngày hôm nay
    return today.isSame(startDate, 'day');
}

// Hàm lấy thông tin thời tiết
// Hàm lấy thông tin thời tiết và thêm biểu tượng thời tiết
async function getWeatherForecast() {
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${weatherApiKey}`;
    
    try {
        const response = await axios.get(weatherUrl);
        const data = response.data;
        const temperature = data.main.temp; // Nhiệt độ hiện tại
        const weather = data.weather[0].main; // Thời tiết chính (Rain, Clear, Clouds,...)
        
        // Biểu tượng thời tiết
        let weatherIcon = '';
        let suggestion = '';

        switch (weather) {
            case 'Rain':
                weatherIcon = '🌧️';
                suggestion = 'Hôm nay trời mưa, bạn nên mang theo ô hoặc áo mưa!';
                break;
            case 'Clear':
                weatherIcon = '☀️';
                suggestion = 'Trời nắng đẹp, bạn có thể mang áo khoác chống nắng!';
                break;
            case 'Clouds':
                weatherIcon = '☁️';
                suggestion = 'Trời có mây, nhiệt độ ổn định, không cần trang bị đặc biệt.';
                break;
            case 'Thunderstorm':
                weatherIcon = '🌩️';
                suggestion = 'Có giông bão, bạn nên cẩn thận khi ra ngoài!';
                break;
            case 'Drizzle':
                weatherIcon = '🌦️';
                suggestion = 'Có mưa phùn, bạn có thể cần mang theo ô.';
                break;
            case 'Snow':
                weatherIcon = '🌨️';
                suggestion = 'Trời có tuyết, bạn cần giữ ấm!';
                break;
            case 'Mist':
            case 'Fog':
                weatherIcon = '🌫️';
                suggestion = 'Có sương mù, hãy lái xe cẩn thận!';
                break;
            default:
                weatherIcon = '🌥️';
                suggestion = `Thời tiết hôm nay là ${weather}, không cần chuẩn bị gì đặc biệt.`;
                break;
        }
        
        return `Nhiệt độ hiện tại: ${temperature}°C. ${weatherIcon}\n${suggestion}`;
    } catch (error) {
        console.error('Lỗi khi lấy thông tin thời tiết:', error);
        return 'Không thể lấy thông tin thời tiết hiện tại.';
    }
}


// Biến ghi nhớ để gửi thông báo một lần trong mỗi khung giờ
let lastSentHour = null;

// Hàm kiểm tra giờ và gửi thông báo nếu là 8h, 9h hoặc 10h sáng
async function checkAndSendReminder() {
    const now = moment(); // Lấy thời gian hiện tại
    const hour = now.hour(); // Lấy giờ hiện tại

    if (isTodayReminderDay()) {
        // Kiểm tra nếu giờ hiện tại là 8h, 9h hoặc 10h sáng và chưa gửi trong giờ đó
        if ((hour === 8 || hour === 9 || hour === 10) && hour !== lastSentHour) {
            const nextDate = calculateNextDate(startDate); // Tính toán ngày gửi tiếp theo
            const formattedNextDate = nextDate.format('DD/MM/YYYY'); // Định dạng ngày gửi tiếp theo
            const weatherMessage = await getWeatherForecast(); // Lấy thông tin thời tiết
            
            const message = `Hôm nay là ngày bạn gửi từ tiếng Anh! Giờ hiện tại: ${hour}h sáng.\nNgày gửi tiếp theo của bạn là: ${formattedNextDate}\n\n${weatherMessage}`;
            
            // Gửi thông báo qua Telegram
            await sendTelegramMessage(message);

            // Cập nhật startDate thành ngày gửi tiếp theo và ghi nhớ giờ đã gửi
            startDate = nextDate;
            lastSentHour = hour;
        }
    }

    // Gửi thông báo thời tiết vào các thời điểm sáng, trưa, chiều, tối
    if ([7, 12, 18].includes(hour) && hour !== lastSentHour) {
        const weatherMessage = await getWeatherForecast();
        await sendTelegramMessage(`Thông báo thời tiết lúc ${hour}h, ngày ${now}:\n\n${weatherMessage}`);
        lastSentHour = hour;
    }
}

// Lên lịch kiểm tra mỗi phút để gửi thông báo
setInterval(checkAndSendReminder, 60 * 1000); // Kiểm tra mỗi phút
