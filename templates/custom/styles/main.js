// Use container fluid
var containers = $(".container");
containers.removeClass("container");
containers.addClass("container-fluid");

$(function() {
    console.log(1);
    $(".nav.level1 > li").addClass("in");
})