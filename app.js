$(document).ready(function() {
    // 구독 폼 제출 이벤트
    $('#subscriptionForm').submit(function(event) {
        event.preventDefault(); // 기본 제출 동작 방지
        var email = $('#email').val();

        // Firebase Auth를 사용하여 이메일로 사용자 등록
        // 등록 성공 시 Firestore에 사용자 정보 저장
        // 성공/실패에 따른 사용자 피드백 처리

        alert("구독이 완료되었습니다!"); // 예시 메시지
    });

    // 반려동물 갤러리 로딩 함수
    function loadPetGallery() {
        // Firestore에서 반려동물 정보를 불러와서 갤러리에 추가
        // 예시:
        // $('#petGallery').append(`<div class="col-md-4 mb-3"><div class="card"><img src="petImageUrl" class="card-img-top" alt="Pet"><div class="card-body"><h5 class="card-title">Pet Name</h5><p class="card-text">Pet Description</p></div></div></div>`);
    }

    loadPetGallery(); // 페이지 로드 시 갤러리 로딩
});