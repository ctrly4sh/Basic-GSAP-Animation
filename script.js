var timelineRef = gsap.timeline();

    timelineRef.from("#nav h2", {
        y: -100,
        duration: 0.5,
        stagger: 0.2,
        // repeat: -1,
        // yoyo: true
    })

    timelineRef.from("#nav h3", {
        y: -100,
        duration: 0.5,
        stagger: 0.2,
        // repeat: -1,
        // yoyo: true
    })

    timelineRef.from("#yash", {
        y:200,
        opacity: 0,
        scale: 1,
        duration: 2,
        repeat: -1,
        yoyo: true
    })

