$('#commentBtn').click(function(){
	alert('clicked me!');
	$.ajax({
		type:"post",
		url:"/api/comment/post",
		data:{
                contentId:$('#contentId').val(),
                content:$('#comment').val(),
            },
        success:function(responseData){
                console.log(responseData);
                location.reload();
            }
	});
});
