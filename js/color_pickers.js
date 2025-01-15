	import "https://cdn.skypack.dev/vanilla-colorful";
	import "https://cdn.skypack.dev/vanilla-colorful/hex-input.js";
	// Function to convert a hex color to RGB
	function hexToRgb(hex) {
	  const r = parseInt(hex.slice(1, 3), 16);
	  const g = parseInt(hex.slice(3, 5), 16);
	  const b = parseInt(hex.slice(5, 7), 16);
	  return {
	    r,
	    g,
	    b
	  };
	}

	// Function to convert RGB to a hex color
	function rgbToHex(r, g, b) {
	  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
	}

	// Function to convert a hue color to RGB
	function hue2rgb(p, q, t) {
	  if (t < 0) t += 1;
	  if (t > 1) t -= 1;
	  if (t < 1 / 6) return p + (q - p) * 6 * t;
	  if (t < 1 / 2) return q;
	  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
	  return p;
	}

	// Function to calculate a color 90 degrees away on the color wheel
	function adjustColor(hexColor, deg, light, sat, maxL) {
	  if (maxL == null) {
	    maxL = 0.95
	  }
	  const rgbColor = hexToRgb(hexColor);

	  // Convert RGB to HSL
	  const r = rgbColor.r / 255;
	  const g = rgbColor.g / 255;
	  const b = rgbColor.b / 255;
	  const max = Math.max(r, g, b);
	  const min = Math.min(r, g, b);
	  let h, s, l = (max + min) / 2;

	  if (max === min) {
	    h = s = 0; // achromatic
	  } else {
	    const d = max - min;
	    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
	    switch (max) {
	      case r:
	        h = (g - b) / d + (g < b ? 6 : 0);
	        break;
	      case g:
	        h = (b - r) / d + 2;
	        break;
	      case b:
	        h = (r - g) / d + 4;
	        break;
	    }
	    h /= 6;
	  }
	  if (deg) {
	    // Calculate the new color 90 degrees away
	    h = (h - deg / 360 + 1) % 1;
	  }
	  if (light) {
	    // Adjust lightness (L) value
	    l = Math.max(Math.min(l + light, maxL), 0);
	    s = Math.max(Math.min(s + -0.1, 1), 0);
	  }
	  if (sat) {
	    s = Math.max(Math.min(s + sat, 1), 0);
	  } else {
	    s = Math.max(Math.min(s + -0.1, 1), 0);

	  }


	  // Convert HSL back to RGB
	  let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
	  let p = 2 * l - q;
	  const rNew = Math.round(hue2rgb(p, q, h + 1 / 3) * 255);
	  const gNew = Math.round(hue2rgb(p, q, h) * 255);
	  const bNew = Math.round(hue2rgb(p, q, h - 1 / 3) * 255);

	  // Convert RGB back to hex color
	  return rgbToHex(rNew, gNew, bNew);
	}

	// Function to update grad_color_2 input and picker with the calculated color
	function updateColorPickers(hexColor, hexColor2, picker) {
	  if (picker === 1) {
	    // Generate 2nd color
	    const calculatedColor = adjustColor(hexColor, 50, -0.3);
	    input2.color = calculatedColor;
	    picker2.color = calculatedColor;
	    input2Hidden.value = calculatedColor; // Set the value of the hidden input

	    // Generate background color
	    const background_color = adjustColor(hexColor, '', 0.5);
	    inputBackground.color = background_color;
	    pickerBackground.color = background_color;
	    inputBackgroundHidden.value = background_color; // Set the value of the hidden input

	    if (hexColor2) {
	      // Generate bubble color
	      const bubble_color = adjustColor(hexColor2, 320, 0.5, -0.1, 0.8);
	      inputBubble.color = bubble_color;
	      pickerBubble.color = bubble_color;
	      inputBubbleHidden.value = bubble_color; // Set the value of the hidden input
	    }
	  }
	  if (picker === 2) {
	    // Generate bubble color
	    const bubble_color = adjustColor(hexColor, 320, 0.5, -0.1, 0.8);
	    inputBubble.color = bubble_color;
	    pickerBubble.color = bubble_color;
	    inputBubbleHidden.value = bubble_color; // Set the value of the hidden input
	  }
	}

	const editIcon1 = document.querySelector('#editIcon1');
	const editIcon2 = document.querySelector('#editIcon2');
	const editIconBackground = document.querySelector('#editIconBackground');
	const editIconBubble = document.querySelector('#editIconBubble');

	// Get the color pickers and inputs
	const picker1 = document.querySelector('#colorPicker1');
	const picker2 = document.querySelector('#colorPicker2');
	const pickerBackground = document.querySelector('#colorPickerBackground');
	const pickerBubble = document.querySelector('#colorPickerBubble');

	const input1 = document.querySelector('#grad_color_1');
	const input2 = document.querySelector('#grad_color_2');
	const inputBackground = document.querySelector('#background_color');
	const inputBubble = document.querySelector('#bubble_color');

	// Get the hidden input fields
	const input1Hidden = document.querySelector('#grad_color_1_hidden');
	const input2Hidden = document.querySelector('#grad_color_2_hidden');
	const inputBackgroundHidden = document.querySelector('#background_color_hidden');
	const inputBubbleHidden = document.querySelector('#bubble_color_hidden');

	// Select all circle wrappers
	document.querySelectorAll('.circle-wrapper').forEach(wrapper => {
	  const overlay = wrapper.querySelector('.overlay');
	  const colorPicker = wrapper.parentElement.querySelector('.color-picker'); // Locate the sibling `hex-color-picker`

	  // Click event to toggle visibility of color-picker
	  overlay.addEventListener('click', () => {
	    // Hide all color pickers
	    document.querySelectorAll('.color-picker').forEach(picker => {
	      if (picker !== colorPicker) {
	        picker.style.display = 'none';
	      }
	    });

	    // Toggle the clicked color picker
	    if (colorPicker.style.display === 'flex') {
	      colorPicker.style.display = 'none'; // Hide if already visible
	    } else {
	      colorPicker.style.display = 'flex'; // Show if hidden
	    }
	  });
	});

	// Get the preview div elements
	const root = document.documentElement;

	// Hide the color pickers when clicked outside
	document.addEventListener('click', (event) => {
	  if (!event.target.closest('.circle-wrapper') && !event.target.closest('.color-picker')) {
	    picker1.style.display = 'none';
	    picker2.style.display = 'none';
	    pickerBackground.style.display = 'none';
	    pickerBubble.style.display = 'none';
	  }
	});

	document.getElementById("moreColors").addEventListener("click", function () {
	  const moreColors = document.querySelector(".more-colors");
	  const isShowing = moreColors.classList.contains("show");

	  // Toggle the class
	  if (isShowing) {
	    moreColors.classList.remove("show");
	    moreColors.style.overflow = 'hidden';
	    this.textContent = "Click for more colors";
	  } else {
	    moreColors.classList.add("show");
	    moreColors.style.overflow = 'visible';
	    this.textContent = "Hide extra colors";
	  }
	});

	// Update the color circles, pickers and inputs in real-time as the user selects colors
	picker1.addEventListener('color-changed', (event) => {
	  input1.color = event.detail.value;
	  updateColorPickers(event.detail.value, input2.color, 1); // Calculate and update grad_color_2
	  input1Hidden.value = event.detail.value; // Set the value of the hidden input
	  updateColorPickers(picker1.color, picker2.color, 1);
	  root.style.setProperty('--c1', picker1.color);
	  root.style.setProperty('--c2', picker2.color);
	  root.style.setProperty('--bgc', pickerBackground.color);
	  root.style.setProperty('--bc', pickerBubble.color);
	});
	picker2.addEventListener('color-changed', (event) => {
	  input2.color = event.detail.value;
	  updateColorPickers(event.detail.value, '', 2); // Calculate and update bubble color
	  input2Hidden.value = event.detail.value; // Set the value of the hidden input
	  updateColorPickers(picker2.color, '', 2);
	  root.style.setProperty('--c2', picker2.color);
	  root.style.setProperty('--bc', pickerBubble.color);
	});
	pickerBackground.addEventListener('color-changed', (event) => {
	  inputBackground.color = event.detail.value;
	  inputBackgroundHidden.value = event.detail.value;
	  root.style.setProperty('--bgc', pickerBackground.color);
	});
	pickerBubble.addEventListener('color-changed', (event) => {
	  inputBubble.color = event.detail.value;
	  inputBubbleHidden.value = event.detail.value;
	  root.style.setProperty('--bc', pickerBubble.color);
	});

	input1.addEventListener('color-changed', (event) => {
	  picker1.color = event.detail.value;
	  updateColorPickers(event.detail.value, input2.color, 1); // Calculate and update grad_color_2
	  input1Hidden.value = event.detail.value;
	  root.style.setProperty('--c1', picker1.color);
	  root.style.setProperty('--c2', picker2.color);
	  root.style.setProperty('--bgc', pickerBackground.color);
	  root.style.setProperty('--bc', pickerBubble.color);
	});
	input2.addEventListener('color-changed', (event) => {
	  picker2.color = event.detail.value;
	  updateColorPickers(event.detail.value, '', 2); // Calculate and update bubble color
	  input2Hidden.value = event.detail.value;
	  root.style.setProperty('--c2', picker2.color);
	  root.style.setProperty('--bc', pickerBubble.color);
	});
	inputBackground.addEventListener('color-changed', (event) => {
	  pickerBackground.color = event.detail.value;
	  inputBackgroundHidden.value = event.detail.value;
	  root.style.setProperty('--bgc', pickerBackground.color);
	});
	inputBubble.addEventListener('color-changed', (event) => {
	  pickerBubble.color = event.detail.value;
	  inputBubbleHidden.value = event.detail.value;
	  root.style.setProperty('--bc', pickerBubble.color);
	});
