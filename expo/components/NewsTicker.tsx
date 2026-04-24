// Effect 1: only runs when width changes (sets up the animation)
useEffect(() => {
  if (width === 0) return;
  translate.setValue(width);
  const loop = Animated.loop(
    Animated.timing(translate, {
      toValue: -width,
      duration: 12000,
      useNativeDriver: true,
      easing: Easing.linear,
    }),
  );
  loop.start();
  return () => loop.stop();
}, [width]);

// Effect 2: cycles messages, resets animation each time
useEffect(() => {
  if (width === 0) return;
  translate.setValue(width); // reset to start on each new message
  const iv = setInterval(() => {
    translate.setValue(width); // reset before next message
    setIdx((i) => (i + 1) % NEWS_MESSAGES.length);
  }, 12000);
  return () => clearInterval(iv);
}, [width]);