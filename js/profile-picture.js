/**
 * Renders the profile picture dynamically in a specified container.
 * The position (X, Y) is calculated based on a ratio retrieved from the database
 * and scaled to the container's width.
 *
 * @param {string} userId - The user ID to fetch profile picture data for.
 * @param {string} containerSelector - The CSS selector for the container where the profile picture will be rendered.
 * @param {string} [defaultImg='path/to/default-icon.png'] - The default image to use if no profile picture is set.
 */

function renderProfilePicture(containerSelector, callback, altPath, defaultImg = 'uploads/profile_default.jpeg') {
  console.log("rendering image");
  const container = document.querySelector(containerSelector);

  if (!container) {
    console.error(`Container not found for selector: ${containerSelector}`);
    return;
  }

  const containerWidth = container.offsetWidth;

  if (containerWidth === 0) {
    console.error('Container width is 0. Ensure the container is visible before calling this function.');
    return;
  }
  console.log("fething image data");
  $.ajax({
    url: 'fetch_image_data.php',
    type: 'GET',
    dataType: 'json',
    success: function (response) {
      console.log(`fetch response: ${response}`);
      if (response.error) {
        console.error(response.error);
        displayError(container, 'Failed to load profile picture.');
        return;
      }


      const imgPath = `${sanitizeURL(altPath || response.img_path || defaultImg)}?t=${new Date().getTime()}`;

      console.log(`img path: ${imgPath}`);
      let scale, posXRatio, posYRatio;
      if (altPath) {
        scale = 1;
        posXRatio = 0;
        posYRatio = 0;
      } else {
        scale = parseFloat(response.img_scale) || 1;
        posXRatio = parseFloat(response.img_pos_x) || 0;
        posYRatio = parseFloat(response.img_pos_y) || 0;
      }

      const img = new Image();
      img.onload = function () {
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        const imgAspectRatio = imgWidth / imgHeight;

        let initWidth, initHeight;

        // Ensure image fills container appropriately
        if (imgAspectRatio > 1) {
          // Landscape: Fill height
          initHeight = containerWidth;
          initWidth = containerWidth * imgAspectRatio;
        } else {
          // Portrait or square: Fill width
          initWidth = containerWidth;
          initHeight = containerWidth / imgAspectRatio;
        }

        // Calculate initial offsets
        const posX = posXRatio * containerWidth;
        const posY = posYRatio * containerWidth;

        // Render image with initial size and adjustments
        const profilePictureHTML = `
          <div class="profile-picture" style="width: ${containerWidth}px; height: ${containerWidth}px;">
              <img src="${sanitizeURL(imgPath)}" alt="Profile Picture" style="
                  position: absolute;
                  top: 50%;
                  left: 50%;
                  transform: translate(-50%, -50%) translate(${posX}px, ${posY}px) scale(${scale});
                  width: ${initWidth}px;
                  height: ${initHeight}px;"
                  data-scale="${scale}"
                  data-x="${posX}"
                  data-y="${posY}">
          </div>
        `;

        container.innerHTML = profilePictureHTML;

        if (typeof callback === 'function') {
          callback();
        }
      };

      img.src = imgPath;
    },
    error: function () {
      console.error('Failed to fetch profile picture data.');
      displayError(container, 'Failed to load profile picture.');
    },
  });
}


/**
 * Sanitizes a URL to prevent potential XSS attacks.
 * @param {string} url - The URL to sanitize.
 * @returns {string} - The sanitized URL.
 */
function sanitizeURL(url) {
  const a = document.createElement('a');
  a.href = url;
  return a.href;
}

/**
 * Displays an error message in the container.
 * @param {Element} container - The container where the error message should be displayed.
 * @param {string} message - The error message to display.
 */
function displayError(container, message) {
  container.innerHTML = `
        <div class="error-message" style="color: red; text-align: center; padding: 10px;">
            ${message}
        </div>
    `;
}
