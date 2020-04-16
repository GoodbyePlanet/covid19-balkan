const particlesConfig = {
  particles: {
    number: { value: 120 },
    color: { value: '#B22222' },
    shape: {
      type: 'circle',
      stroke: { width: 1, color: '#ff4d4d' },
      polygon: { nb_sides: 5 },
    },
    opacity: {
      value: 9,
      random: true,
      anim: { enable: true, speed: 2, opacity_min: 0, sync: false },
    },
    size: {
      value: 3,
      random: true,
      anim: { enable: false, speed: 4, size_min: 0.3, sync: false },
    },
    line_linked: {
      enable: true,
      distance: 64,
      color: '#B22222',
      opacity: 0.2,
      width: 0,
    },
    move: {
      enable: true,
      speed: 1,
      direction: 'none',
      random: true,
      straight: false,
      out_mode: 'out',
      bounce: false,
      attract: { enable: false, rotateX: 600, rotateY: 600 },
    },
  },
  retina_detect: true,
};

export default particlesConfig;
