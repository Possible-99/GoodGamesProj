$("#comment-keypress").keydown(function () {
    var numbCharact = $(this).val().length
    $("#numbCharac").html(numbCharact)
});
