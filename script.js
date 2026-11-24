/* =========================================================
   THE OBSERVATORY — interactive layer
   Parallax · reveal · 3D tilt · copy
========================================================= */

(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* ---------------------------------------------------
     Cursor glow
  --------------------------------------------------- */
  var glow = document.querySelector(".cursor-glow");

  if (glow && finePointer) {
    var glowX = window.innerWidth / 2;
    var glowY = window.innerHeight / 2;
    var targetX = glowX;
    var targetY = glowY;

    window.addEventListener("pointermove", function (event) {
      targetX = event.clientX;
      targetY = event.clientY;
      glow.classList.add("is-live");
    });

    (function follow() {
      glowX += (targetX - glowX) * 0.16;
      glowY += (targetY - glowY) * 0.16;
      glow.style.transform = "translate3d(" + glowX + "px," + glowY + "px,0)";
      requestAnimationFrame(follow);
    })();
  }

  /* ---------------------------------------------------
     Orbit stage parallax (home)
  --------------------------------------------------- */
  var stage = document.querySelector(".world");

  if (stage && finePointer && !reduceMotion) {
    var stageX = 0;
    var stageY = 0;
    var stageTargetX = 0;
    var stageTargetY = 0;

    window.addEventListener("pointermove", function (event) {
      stageTargetX = (event.clientX / window.innerWidth - 0.5) * -26;
      stageTargetY = (event.clientY / window.innerHeight - 0.5) * -18;
    });

    (function drift() {
      stageX += (stageTargetX - stageX) * 0.06;
      stageY += (stageTargetY - stageY) * 0.06;
      stage.style.setProperty("--px", stageX.toFixed(2) + "px");
      stage.style.setProperty("--py", stageY.toFixed(2) + "px");
      requestAnimationFrame(drift);
    })();
  }

  /* ---------------------------------------------------
     Card highlight + tilt
  --------------------------------------------------- */
  var tiltTargets = document.querySelectorAll(
    ".project-feature"
  );

  Array.prototype.forEach.call(tiltTargets, function (card) {
    card.addEventListener("pointermove", function (event) {
      var box = card.getBoundingClientRect();
      var x = ((event.clientX - box.left) / box.width) * 100;
      var y = ((event.clientY - box.top) / box.height) * 100;

      card.style.setProperty("--mx", x + "%");
      card.style.setProperty("--my", y + "%");

      if (finePointer && !reduceMotion && card.classList.contains("is-tilting")) {
        var rx = (0.5 - y / 100) * 7;
        var ry = (x / 100 - 0.5) * 9;
        card.style.transform =
          "perspective(800px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) +
          "deg) translate3d(0, -5px, 16px)";
      }
    });

    card.addEventListener("pointerenter", function () {
      card.classList.add("is-tilting");
    });

    card.addEventListener("pointerleave", function () {
      card.classList.remove("is-tilting");
      card.style.transform = "";
      card.style.removeProperty("--mx");
      card.style.removeProperty("--my");
    });
  });

  /* ---------------------------------------------------
     Reveal on scroll
  --------------------------------------------------- */
  var reveals = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window && !reduceMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
    );

    Array.prototype.forEach.call(reveals, function (el) {
      observer.observe(el);
    });
  } else {
    Array.prototype.forEach.call(reveals, function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---------------------------------------------------
     Scroll progress
  --------------------------------------------------- */
  var progress = document.querySelector(".scroll-progress");

  if (progress) {
    var updateProgress = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var ratio = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
      progress.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
    };

    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
  }

  /* Planets are plain links: selecting one navigates straight to its page. */

  /* ---------------------------------------------------
     Copy email
  --------------------------------------------------- */
  var copyButton = document.querySelector("[data-copy]");

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      var value = copyButton.getAttribute("data-copy");
      var restore = copyButton.textContent;

      var done = function () {
        copyButton.textContent = "Copied";
        copyButton.classList.add("is-copied");
        window.setTimeout(function () {
          copyButton.textContent = restore;
          copyButton.classList.remove("is-copied");
        }, 1800);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(done, done);
      } else {
        done();
      }
    });
  }
})();
