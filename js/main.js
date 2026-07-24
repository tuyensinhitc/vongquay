const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxxGlSrB72tzdkHpWEEqAw43XaJZ8B2pULbAQUnav0EKyaK0B02bWHDgAUxt_Hdqsj_3A/exec';
const STORAGE_KEY = 'itc_wheel_played';

// Danh sách giải thưởng và tổng percentpage phải = 1.0
var prizes = [
    {
        text: "Học bổng 100%",
        img: "images/100.png",
        percentpage: 0.00
    },
    {
        text: "Thẻ điện thoại 100K",
        img: "images/thecao100k.png",
        percentpage: 0.00
    },
    {
        text: "Học bổng 10%",
        img: "images/10.png",
        percentpage: 0.23
    },
    {
        text: "Thẻ điện thoại 200K",
        img: "images/thecao200k.png",
        percentpage: 0.00
    },
    {
        text: "Học bổng 15%",
        img: "images/15.png",
        percentpage: 0.15
    },
    {
        text: "Thẻ điện thoại 10K",
        img: "images/thecao10k.png",
        percentpage: 0.25
    },
    {
        text: "Học bổng 20%",
        img: "images/20.png",
        percentpage: 0.09
    },
    {
        text: "Thẻ điện thoại 20K",
        img: "images/thecao20k.png",
        percentpage: 0.15
    },
    {
        text: "Học bổng 30%",
        img: "images/30.png",
        percentpage: 0.00
    },
    {
        text: "Thẻ điện thoại 30K",
        img: "images/thecao30k.png",
        percentpage: 0.08
    },
    {
        text: "Học bổng 50%",
        img: "images/50.png",
        percentpage: 0.005
    },
    {
        text: "Thẻ điện thoại 50K",
        img: "images/thecao50k.png",
        percentpage: 0.005
    },

];

// Biến toàn cục
var currentPrizeText = '';
var isPercentage = true;

// Kiểm tra đã chơi
function hasPlayed() {
    return localStorage.getItem(STORAGE_KEY) === 'true';
}

function markAsPlayed() {
    localStorage.setItem(STORAGE_KEY, 'true');
}

function showAlreadyPlayedMessage() {
    Swal.fire({
        title: 'Đã hết lượt chơi!',
        text: 'Bạn đã quay vòng quay rồi. Mỗi người chỉ có 1 cơ hội thôi nha',
        icon: 'warning',
        confirmButtonText: 'Đã hiểu',
        backdrop: false,
        allowOutsideClick: false
    });
}

function disableSpinButton() {
    const btn = document.querySelector('.hc-luckywheel-btn');
    btn.style.pointerEvents = 'none';
    btn.style.opacity = '0.5';
    btn.style.cursor = 'not-allowed';
}

// Random
function randomIndex(prizes) {
    if (!isPercentage) {
        return Math.floor(Math.random() * prizes.length);
    }

    let rand = Math.random();
    let cumulativeProbability = 0;

    console.log("Random value:", rand.toFixed(4));

    for (let i = 0; i < prizes.length; i++) {
        cumulativeProbability += prizes[i].percentpage;
        console.log(`  Index ${i}: cumulative = ${cumulativeProbability.toFixed(4)}`);

        if (rand < cumulativeProbability) {
            console.log(`Selected: Index ${i} - ${prizes[i].text}`);
            return i;
        }
    }

    console.warn("Fallback to last prize");
    return prizes.length - 1;
}

// Form
document.getElementById('winnerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = {
        name: document.getElementById('fullName').value,
        phone: document.getElementById('phoneNumber').value,
        address: document.getElementById('userAddress').value,
        prize: currentPrizeText
    };

    document.getElementById('winnerForm').style.display = 'none';
    document.getElementById('formLoading').classList.add('active');

    try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: JSON.stringify(formData)
        });

        setTimeout(() => {
            document.getElementById('formLoading').classList.remove('active');
            document.getElementById('prizeFormModal').classList.remove('active');

            Swal.fire({
                title: 'Thành công!',
                text: 'Thông tin của bạn đã được ghi nhận. Đội ngũ admin sẽ nhanh chóng liên lạc với bạn để xác nhận thông tin nhận thưởng!',
                icon: 'success',
                confirmButtonText: 'OK',
                backdrop: false,
                allowOutsideClick: false
            }).then(() => {
                document.getElementById('winnerForm').reset();
                document.getElementById('winnerForm').style.display = 'block';
                disableSpinButton();
            });
        }, 1000);

    } catch (error) {
        document.getElementById('formLoading').classList.remove('active');
        document.getElementById('winnerForm').style.display = 'block';

        Swal.fire({
            title: 'Lỗi!',
            text: 'Không thể gửi thông tin. Vui lòng thử lại!',
            icon: 'error',
            confirmButtonText: 'OK',
            backdrop: false,
            allowOutsideClick: false
        });
    }
});

document.getElementById('cancelFormBtn').addEventListener('click', () => {
    document.getElementById('prizeFormModal').classList.remove('active');
    document.getElementById('winnerForm').reset();
});

// Khởi tạo vòng quay
document.addEventListener("DOMContentLoaded", function () {
    const totalProbability = prizes.reduce((sum, p) => sum + p.percentpage, 0);
    console.log("Tổng xác suất:", totalProbability.toFixed(2));

    hcLuckywheel.init({
        id: "luckywheel",
        config: function (callback) {
            callback && callback(prizes);
        },
        mode: "both",
        getPrize: function (callback) {
            if (hasPlayed()) {
                showAlreadyPlayedMessage();
                return;
            }

            var rand = randomIndex(prizes);
            var chances = rand;
            callback && callback([rand, chances]);
        },
        gotBack: function (data, index) {
            console.log("=== GOTBACK CALLED ===");
            console.log("Raw data:", data);
            console.log("Index:", index);

            markAsPlayed();

            // Tắt toàn bộ SweetAlert từ thư viện
            const originalSwal = window.Swal;
            window.Swal = {
                fire: function () {
                    console.log("Swal.fire blocked from library");
                    return Promise.resolve();
                }
            };

            let prizeText = '';
            let prizeImg = '';

            if (typeof index === 'number' && prizes[index]) {
                prizeText = prizes[index].text;
                prizeImg = prizes[index].img;
            } else if (typeof data === 'string') {
                prizeText = data;
                let foundPrize = prizes.find(p => p.text === data);
                prizeImg = foundPrize ? foundPrize.img : '';
            }

            console.log("Final prize text:", prizeText);
            console.log("Final prize img:", prizeImg);

            currentPrizeText = prizeText;

            setTimeout(() => {
                window.Swal = originalSwal;

                if (!window.Swal || !window.Swal.fire) {
                    console.error("SweetAlert2 không khả dụng");
                    alert(`Chúc mừng! Bạn đã trúng: ${prizeText}`);
                    return;
                }

                if (data == null || prizeText == null) {
                    originalSwal.fire({
                        title: 'Chương trình kết thúc',
                        text: 'Đã hết phần thưởng',
                        icon: 'error',
                        confirmButtonText: 'Đóng',
                        backdrop: false,
                        allowOutsideClick: false
                    });
                } else if (prizeText === 'Chúc bạn may mắn lần sau' || prizeText.includes('may mắn')) {
                    originalSwal.fire({
                        title: 'Lần này bạn chưa may mắn lắm',
                        text: 'Chúc bạn may mắn lần sau.',
                        imageUrl: prizeImg || './images/hengaplai.png',
                        imageWidth: 100,
                        imageHeight: 100,
                        confirmButtonText: 'OK',
                        backdrop: false,
                        allowOutsideClick: false,
                        customClass: {
                            popup: 'simple-swal-popup',
                            confirmButton: 'simple-swal-button'
                        },
                        imageAlt: 'Logo ITC'
                    }).then(() => {
                        disableSpinButton();
                    }).catch(err => {
                        console.error("Lỗi hiển thị popup:", err);
                    });
                } else {
                    document.getElementById('prizeDisplayBox').textContent = `Bạn đã trúng: ${prizeText}`;
                    document.getElementById('prizeFormModal').classList.add('active');
                }
            }, 100);
        }
    });

    if (hasPlayed()) {
        disableSpinButton();
        setTimeout(() => {
            showAlreadyPlayedMessage();
        }, 500);
    }
}, false);
