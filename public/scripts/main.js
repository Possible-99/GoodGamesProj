$("#comment-keypress").keydown(function () {
  var numbCharact = $(this).val().length;
  $("#numbCharac").html(numbCharact);
});

gsap.from(".search-section", { duration: 0.9, y: "-200", ease: "bounce.out" });

var t1 = new TimelineMax({ onUpdate: updatePercentage });
const controller = new ScrollMagic.Controller();
t1.from(".game-card-anim", 0.5, { opacity: 0, x: -200 });
const scene = new ScrollMagic.Scene({
  triggerElement: ".upcoming",
  triggerHook: "onLeaving",
  duration: "74%",
})
  .setTween(t1)
  .addTo(controller);

function updatePercentage() {
  t1.progress();
}
