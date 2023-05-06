/*!
 * Created by Canvas Dojo <https://github.com/znxkznxk1030/canvas-dojo>
 *
 * canvas-boilerplate by <https://github.com/christopher4lis/canvas-boilerplate>
 * Learn more https://chriscourses.com/
 */

const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const mouse = {
  x: innerWidth / 2,
  y: innerHeight / 2,
};

const colors = ["#2185C5", "#FFF6E5", "#FF7F66"];

// Event Listeners
addEventListener("mousemove", (event) => {
  mouse.x = event.clientX;
  mouse.y = event.clientY;
});

addEventListener("resize", () => {
  canvas.width = innerWidth;
  canvas.height = innerHeight;

  init();
});

let increment = 0

// Bird
class Bird {
  constructor() {
    this.id = increment++;
    this.x = 0
    this.y = 0
    this.velocity = {
      x: (Math.random() - 0.2) * 12,
      y: (Math.random() - 0.2) * 12,
    };
    this.radius = 15;
    this.color = "#000";
    this.mass = 0.5;
    this.opacity = 1;
    this.vital = 100;
    this.type = Bird
    this.hasMite = false
  }

  create(particles) {
    const radius = this.radius
    this.x = randomIntFromRange(radius, innerWidth - radius);
    this.y = randomIntFromRange(radius, innerHeight - radius);

    for (let j = 0; j < particles.length; j++) {
      const particle = particles[j];

      if (distance(this.x, this.y, particle.x, particle.y) < radius * 2) {
        this.x = randomIntFromRange(radius, innerWidth - radius);
        this.y = randomIntFromRange(radius, innerHeight - radius);

        j = -1;
      }
    }

    particles.push(this);
  }

  draw() {
    c.beginPath();
    c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    c.save();
    c.globalAlpha = this.opacity;
    c.fillStyle = this.color;
    c.fill();
    c.restore();
    c.strokeStyle = this.color;
    c.stroke();
    c.closePath();

    if (this.hasMite) {
      c.beginPath();
      c.arc(this.x + 1, this.y + 1, this.radius / 3, 0, Math.PI * 2, false);
      c.save();
      c.globalAlpha = this.opacity;
      c.fillStyle = '#000';
      c.fill();
      c.restore();
      c.strokeStyle = '#000';
      c.stroke();
      c.closePath();
    }
  }

  update(particles, removals) {
    this.draw();

    particles.forEach((particle) => {
      if (this === particle) return;

      if (distance(this.x, this.y, particle.x, particle.y) < this.radius * 2) {
        resolveCollision(this, particle);
      }

      if (this.x - this.radius <= 0 || this.x + this.radius >= innerWidth) {
        this.velocity.x *= -1;
      }

      if (this.y - this.radius <= 0 || this.y + this.radius >= innerHeight) {
        this.velocity.y *= -1;
      }
    });

    this.x += this.velocity.x;
    this.y += this.velocity.y;

    if (this.hasMite == false ){
      this.hasMite = randomIntFromRange(0, 1000) > 5? false: true;
    }

    this.vital += this.hasMite? -2: 1
    console.log(this.vital)


    if (this.vital >= 300) {
      this.vital = 100
      const newBird = new this.type()
      newBird.create(particles)
      console.log("create event")
    } else if (this.vital <= 0) {
      removals.push(this)
    }
  }
}

class Sucker extends Bird {
  constructor() {
    super()
    this.color = "#2185C5"
    this.type = Sucker
  }

  update(particles, removals) {
    super.update(particles, removals)

    particles.forEach((otherBird) => {
      if (this === otherBird) return;

      if (distance(this.x, this.y, otherBird.x, otherBird.y) < this.radius * 2) {
        if (otherBird.hasMite) {
          otherBird.hasMite = false
          this.vital -= 20
        }
      }
    });
  }
}

class Cheater extends Bird  {
  constructor() {
    super()
    this.color = "#FF7F66"
    this.type = Cheater
  }

  update(particles, removals) {
    super.update(particles, removals)
  }
}

class Grudger extends Bird  {
  constructor() {
    super()
    this.color = "#008D62"
    this.type = Grudger
    this.blacklist = new Set()
  }

  update(particles, removals) {
    super.update(particles, removals)

    particles.forEach((otherBird) => {
      if (this === otherBird) return;

      if (distance(this.x, this.y, otherBird.x, otherBird.y) < this.radius * 2) {
        if (this.hasMite && otherBird instanceof Cheater) {
          this.blacklist.add(otherBird.id)
        }

        if (otherBird.hasMite && !this.blacklist.has(otherBird.id)) {
          otherBird.hasMite = false
          this.vital -= 20
        }
      }
    });
  }
}

const birdTypes = [ Sucker, Cheater, Grudger ]


// Implementation
let particles;
function init() {
  particles = [];
  for (let i = 0; i < 15; i++) {
    const bird = new Sucker()
    bird.create(particles)
  }

  for (let i = 0; i < 15; i++) {
    const bird = new Cheater()
    bird.create(particles)
  }

  for (let i = 0; i < 15; i++) {
    const bird = new Grudger()
    bird.create(particles)
  }
}

// Animation Loop
function animate() {
  setTimeout(() => {
    requestAnimationFrame(animate);
  }, 5);
  c.clearRect(0, 0, canvas.width, canvas.height);

  let removals = []
  particles.forEach((particle) => {
    particle.update(particles, removals);
  });

  console.log(removals)
  particles = particles.filter(bird => removals.findIndex(_bird => bird.id === _bird.id))
}

init();
animate();

/**
 *  utils.js - <https://github.com/christopher4lis/canvas-boilerplate/blob/master/src/js/utils.js>
 *  @function randomIntFromRange Picks a random integer within a range
 *  @function randomColor Picks a random color
 *  @function dispatch Find the distance between two points
 **/

function randomIntFromRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomColor(colors) {
  return colors[Math.floor(Math.random() * colors.length)];
}

function randomType(type) {
  return type[Math.floor(Math.random() * type.length)];
}

function distance(x1, y1, x2, y2) {
  const xDist = x2 - x1;
  const yDist = y2 - y1;

  return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2));
}

/**
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @param  Object | velocity | The velocity of an individual particle
 * @param  Float  | angle    | The angle of collision between two objects in radians
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 */

function rotate(velocity, angle) {
  const rotatedVelocities = {
    x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
    y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle),
  };

  return rotatedVelocities;
}

/**
 * Swaps out two colliding particles's x and y velocities after running through
 * an elastic collision reaction equation
 *
 * @param  Object | particle      | A particle object with x and y coordinates, plus velocity
 * @param  Object | otherParticle | A particle object with x and y coordinates, plus velocity
 * @return Null   | Dose not return a value
 */

function resolveCollision(particle, otherParticle) {
  const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
  const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

  const xDist = otherParticle.x - particle.x;
  const yDist = otherParticle.y - particle.y;

  // Prevent accidental overlap of particles
  if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {
    // Grab angle between the two colliding particles
    const angle = -Math.atan2(
      otherParticle.y - particle.y,
      otherParticle.x - particle.x
    );

    // Store mass in var for better readability in collision equation
    const m1 = particle.mass;
    const m2 = otherParticle.mass;

    // Velocity before equation
    const u1 = rotate(particle.velocity, angle);
    const u2 = rotate(otherParticle.velocity, angle);

    // Velocity after 1d collision equation
    const v1 = {
      x: (u1.x * (m1 - m2)) / (m1 + m2) + (u2.x * 2 * m2) / (m1 + m2),
      y: u1.y,
    };
    const v2 = {
      x: (u2.x * (m1 - m2)) / (m1 + m2) + (u1.x * 2 * m2) / (m1 + m2),
      y: u2.y,
    };

    // Final velocity after rotating axis back to original location
    const vFinal1 = rotate(v1, -angle);
    const vFinal2 = rotate(v2, -angle);

    // Swap particle velocites for realistic bounce effect
    particle.velocity.x = vFinal1.x;
    particle.velocity.y = vFinal2.y;

    otherParticle.velocity.x = vFinal2.x;
    otherParticle.velocity.y = vFinal2.y;
  }
}
