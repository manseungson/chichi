document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('rouletteCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 300;
    canvas.height = 300;

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 0, Math.PI * 2, true);
    ctx.clip();

    const spinButton = document.getElementById('spinRoulette');
    const employeeInput = document.getElementById('employeeId');
    const rouletteImage = new Image();

    function drawNeedle() {
        const centerX = canvas.width / 2;
        const centerY = 10; // 바늘 끝부분의 y좌표
        const needleWidth = 6;

        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX - needleWidth / 2, 0);
        ctx.lineTo(centerX + needleWidth / 2, 0);
        ctx.closePath();
        ctx.fill();
    }

    const storageRef = firebase.storage().ref();
    const rouletteImageRef = storageRef.child('image/img_roulette_02.png');

    rouletteImageRef.getDownloadURL().then(function(url) {
        rouletteImage.onload = function() {
            ctx.drawImage(rouletteImage, 0, 0, canvas.width, canvas.height);
            drawNeedle();
        };
        rouletteImage.src = url;
    }).catch(function(error) {
        console.error("Error loading image from Firebase Storage:", error);
    });
    

    function spinRoulette() {
        const employeeId = employeeInput.value.trim();
        if (!employeeId) {
            alert('사번을 입력해주세요.');
            return;
        }

        const today = new Date().toISOString().split('T')[0]; // 오늘 날짜를 YYYY-MM-DD 형식으로 가져옴

        // 사용자의 마지막 참여 날짜를 확인
        db.collection('users').doc(employeeId).get().then((doc) => {
            if (doc.exists && doc.data().lastParticipationDate === today) {
                alert('오늘은 이미 참여하셨습니다.');
                return;
            }

            const prizes = ["커피쿠폰", "아쉽네요", "스티커", "꽝", "와펜", "다음기회에"];
            // '당첨 횟수' 문서에서 오늘 날짜의 '스티커'와 '와펜' 당첨 횟수를 확인
            db.collection('prizeCounts').doc(today).get().then((doc) => {
                const data = doc.exists ? doc.data() : {};
                const stickerCount = data['스티커'] || 0;
                const wappenCount = data['와펜'] || 0;
                const coffeecoupon = data['커피쿠폰'] || 0;

                if (stickerCount >= 10 && wappenCount >= 10) {
                    alert('오늘의 상품이 모두 소진되었습니다.');
                    return;
                }

                let currentRotation = 0;
                const finalRotation = Math.floor(Math.random() * 360) + 1440; // 최소 4바퀴 회전

                const spin = () => {
                    if (currentRotation < finalRotation) {
                        currentRotation += 10; // 회전 속도
                        ctx.clearRect(0, 0, canvas.width, canvas.height);
                        ctx.save();
                        ctx.translate(canvas.width / 2, canvas.height / 2);
                        ctx.rotate(currentRotation * Math.PI / 180);
                        ctx.drawImage(rouletteImage, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
                        ctx.restore();
                        drawNeedle();
                        requestAnimationFrame(spin);
                    } else {
                        const finalAngle = currentRotation % 360;
                        const prizeIndex = Math.floor((360 - finalAngle) / (360 / prizes.length)) % prizes.length;
                        const prize = prizes[prizeIndex];

                        if ((prize === '스티커' && stickerCount >= 3) || (prize === '와펜' && wappenCount >= 3) || (prize === '커피쿠폰' && wappenCount >= 3) ) {
                            alert(`"${prize}"이 소진되었습니다.`);
                        } else {
                            setTimeout(() => {
                                alert(`"${prize}"`);
                                // 당첨된 상품의 횟수 업데이트
                                const update = {};
                                update[prize] = (data[prize] || 0) + 1;
                                db.collection('prizeCounts').doc(today).set(update, { merge: true });

                                // 사용자의 마지막 참여 날짜 업데이트
                                db.collection('users').doc(employeeId).set({
                                    lastParticipationDate: today
                                }, { merge: true });
                            }, 100);
                        }
                    }
                };

                requestAnimationFrame(spin);
            }).catch(function(error) {
                console.error("Error getting prize counts:", error);
            });
        }).catch(function(error) {
            console.error("Error checking user participation:", error);
        });
    }

    spinButton.addEventListener('click', spinRoulette);
});
