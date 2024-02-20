document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('rouletteCanvas');
    const ctx = canvas.getContext('2d');

    // 룰렛 애니메이션 함수
    function spinRouletteAnimation() {
        const ctx = canvas.getContext('2d');
        let angle = 0;
        const spinAnimation = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(angle * Math.PI / 180);
            ctx.fillStyle = "#FF0000";
            ctx.fillRect(-50, -50, 100, 100);
            ctx.restore();
            angle += 10;
            if (angle < 3600) { // 약 10회 회전
                requestAnimationFrame(spinAnimation);
            } else {
                alert("룰렛이 멈췄습니다!");
            }
        };
        spinAnimation();
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

    spinButton.addEventListener('click', function() { // 수정: 버튼 클릭 이벤트 핸들러 수정
        const employeeId = employeeInput.value.trim();
        if (!employeeId) {
            alert('사번을 입력해주세요.');
            return;
        }
        checkAndUpdateParticipation(employeeId);
    });
});
