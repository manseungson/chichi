document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('rouletteCanvas');


    // 룰렛 애니메이션 함수
    function spinRouletteAnimation() {
        const prizes = ["스타벅스", "꽝!", "CU 상품권", "꽝!", "CAFE:LET 굿즈", "꽝!", "햄버거세트", "꽝!"]; // 당첨 상품 목록
        const ctx = canvas.getContext('2d');
        let angle = 0;
        const radius = 100; // 룰렛의 반지름
        const textRadius = radius * 0.75; // 텍스트를 그릴 반지름 위치
        const sectionAngle = 360 / prizes.length; // 8개 섹션, 각 섹션의 각도
        let finalAngle = Math.floor(Math.random() * 360) + 360 * 8; // 랜덤한 최종 각도 설정
        


        const spinAnimation = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);

            // 룰렛판 그리기
            for (let i = 0; i < prizes.length; i++) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                let startAngle = (i * sectionAngle + angle) * Math.PI / 180;
                let endAngle = ((i + 1) * sectionAngle + angle) * Math.PI / 180;
                ctx.arc(0, 0, radius, startAngle, endAngle);
                ctx.fillStyle = `hsl(${i * (360 / prizes.length)}, 100%, 50%)`;
                ctx.fill();

                // 상품명 배치
                drawText(ctx, (startAngle + endAngle) / 2, prizes[i]);
            }

            // 화살표 바늘 그리기
            ctx.restore();
            drawArrow(ctx);

            angle += 10;
            if (angle < finalAngle) {
                requestAnimationFrame(spinAnimation);
            } else {
                // 최종 각도를 기준으로 당첨된 상품 계산
                let normalizedFinalAngle = finalAngle % 360;
                // Normalize the final angle to always start from the 'top' of the roulette
                normalizedFinalAngle = (normalizedFinalAngle + sectionAngle / 2) % 360;
                // Calculate the winning index based on the normalized angle
                const winningIndex = Math.floor((360 - normalizedFinalAngle) / sectionAngle) % prizes.length;
                alert(`당첨된 상품: ${prizes[winningIndex]}`);
            }
        };
        spinAnimation();
    }

    // 섹션에 상품명을 그리는 함수
    function drawText(ctx, angle, text) {
        ctx.save();
        ctx.rotate(angle);
        ctx.translate(0, -80); // 텍스트 위치 조정
        ctx.rotate(-angle); // 텍스트를 다시 똑바로 회전

        // 텍스트 길이에 따라 폰트 사이즈 조절
        let fontSize = 14;
        if (text.length > 8) {
            fontSize = 10;
        }

        ctx.fillStyle = "white";
        ctx.font = `${fontSize}px Arial`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, 0, 0);
        ctx.restore();
    }

    // 화살표 바늘을 그리는 함수
    function drawArrow(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.translate(canvas.width / 2, canvas.height / 2 - 100); // 화살표의 위치를 캔버스 중심으로 조정
        ctx.moveTo(0, 10); // 화살표 꼭지점이 아래를 향하도록 시작점 조정
        ctx.lineTo(5, -10); // 화살표의 오른쪽 날개
        ctx.lineTo(-5, -10); // 화살표의 왼쪽 날개
        ctx.closePath(); // 화살표의 윤곽을 닫아주어 완성된 모양을 만듬
        ctx.fillStyle = "#000000"; // 화살표의 색상 설정
        ctx.fill();
        ctx.restore();
    }

    // Firestore에서 사용자 참여 기록 확인 및 업데이트
    function checkAndUpdateParticipation(employeeId) {
        const userRef = db.collection('users').doc(employeeId);

        userRef.get().then((doc) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (doc.exists && doc.data().lastParticipationDate.toDate() >= today) {
                alert('오늘은 이미 참여하셨습니다.');
            } else {
                spinRouletteAnimation();
                userRef.set({
                    lastParticipationDate: firebase.firestore.Timestamp.fromDate(new Date())
                });
            }
        }).catch((error) => {
            console.error("Error getting document:", error);
        });
    }

    const spinButton = document.getElementById('spinRoulette'); // 수정: 버튼 ID 수정
    const employeeInput = document.getElementById('employeeId');

    spinButton.addEventListener('click', function () { // 수정: 버튼 클릭 이벤트 핸들러 수정
        const employeeId = employeeInput.value.trim();
        if (!employeeId) {
            alert('사번을 입력해주세요.');
            return;
        }
        checkAndUpdateParticipation(employeeId);
    });
});
