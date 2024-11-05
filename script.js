let positions_matrix_1 = Array();
let positions_matrix_2 = Array();
let colour_value = 50;
const grain_size = 5;
const columns = 2000 / grain_size;
const rows = 1000 / grain_size;

let capture_interval_id = null; // To store the interval ID

function create_starting_matrix_1(columns, rows) {
    for (let i = 0; i < rows; i++) { // loops over number of rows
        let row = Array();
        for (let i = 0; i < columns; i++) { // loops over number of columns
            row.push(0); // 0 for a black square, 1 for a white square
            // row.push(Math.round(Math.random())); // Randomly assign 0 or 1 for test purposes
        };
        positions_matrix_1.push(row);
    };
};
function create_starting_matrix_2(columns, rows) {
    for (let i = 0; i < rows; i++) { // loops over number of rows
        let row = Array();
        for (let i = 0; i < columns; i++) { // loops over number of columns
            row.push(0); // 0 for a black square, 1 for a white square
            // row.push(Math.round(Math.random())); // Randomly assign 0 or 1 for test purposes
        };
        positions_matrix_2.push(row)
    };
};

create_starting_matrix_1(columns,rows);
create_starting_matrix_2(columns,rows);

const canvas = document.getElementById("canvas"); // Accesses canvas element in html
var ctx = canvas.getContext('2d'); // Creates a context to be able to draw on the canvas

function draw_canvas(matrix) {
    const imageData = ctx.createImageData(columns * grain_size, rows * grain_size); // Full canvas dimensions
    const data = imageData.data;

    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < columns; x++) {
            const value = matrix[y][x]; // 0 for black, 1 for white

            const green_color = value === 0 ? 20 : value; // Green (20 for black, 1-255 for varying shades of green)
            const red_color = value === 0 ? 20 : 255; // Red (20 for black, 255 otherwise)

            // Calculate the starting index in the imageData array for each square
            for (let dy = 0; dy < grain_size; dy++) {
                for (let dx = 0; dx < grain_size; dx++) {
                    const pixelIndex = 4 * ((y * grain_size + dy) * columns * grain_size + (x * grain_size + dx));
                    
                    data[pixelIndex] = red_color;        // Red
                    data[pixelIndex + 1] = green_color;    // Green
                    data[pixelIndex + 2] = 20;    // Blue
                    data[pixelIndex + 3] = 255;      // Alpha (fully opaque)
                }
            }
        }
    }

    ctx.putImageData(imageData, 0, 0); // Render the imageData on the canvas
    
};

function check_falling_sand() {

    for (let i = rows - 1; i >= 0; i--) { // Loop from bottom to top to avoid overwriting particles above
        
        for (let j = 0; j < columns; j++) {

            if (positions_matrix_1[i][j] == 0) {
                continue; // Skip if the current position is empty
            };

            // Check if the particle can fall directly down
            if (i + 1 < rows && positions_matrix_1[i + 1][j] == 0) {
                positions_matrix_2[i + 1][j] = positions_matrix_1[i][j];
            }
            // Check if the particle is at the bottom and can't fall further
            else if (i + 1 >= rows) {
                positions_matrix_2[i][j] = positions_matrix_1[i][j];
            }
            // Check if the particle has another particle directly below it
            else if (positions_matrix_1[i + 1][j] != 0) {
                
                // Check both left and right below for available space
                const leftFree = j - 1 >= 0 && positions_matrix_1[i + 1][j - 1] == 0;
                const rightFree = j + 1 < columns && positions_matrix_1[i + 1][j + 1] == 0;

                if (leftFree && rightFree) { // Both sides free
                    const random_direction = Math.random() < 0.5 ? -1 : 1; 
                    positions_matrix_2[i + 1][j + random_direction] = positions_matrix_1[i][j];
                }
                else if (leftFree) { // Only left side free
                    positions_matrix_2[i + 1][j - 1] = positions_matrix_1[i][j];
                }
                else if (rightFree) { // Only right side free
                    positions_matrix_2[i + 1][j + 1] = positions_matrix_1[i][j];
                }
                else { // Neither side is free; stay in place
                    positions_matrix_2[i][j] = positions_matrix_1[i][j];
                };
            };
        };
    };
};

function set_new_matrices() {
    positions_matrix_1 = positions_matrix_2;
    positions_matrix_2 = Array();
    create_starting_matrix_2(columns,rows);
};

let colour_increasing = true;
function update_colour_value() {
    const random_update_chance = Math.random()
    if (colour_increasing == true) {
        if (random_update_chance > 0.75) {
            colour_value = colour_value + 1;
        };
    }
    else if (colour_increasing == false) {
        if (random_update_chance > 0.75) {
            colour_value = colour_value - 1;
        };
    }
    
    if (colour_value >= 200) {
        colour_increasing = false
    }
    else if (colour_value <= 50) {
        colour_increasing = true
    };
};

let loop = false;
let inactivity = 0;
let mouse_down = false; // Tracks whether the mouse is currently held down
// Mouse down event listener
canvas.addEventListener("mousedown", function(event) {
    mouse_down = true; // Mouse is now held down
    handle_mousedown_event(event); // Call the function to add sand at the initial click point
    inactivity = 0;
    start(50);
});
// Mouse move event listener
canvas.addEventListener("mousemove", function(event) {
    if (mouse_down) {
        const currentTime = Date.now();
        // Throttle the event handling
        if (currentTime - lastMouseMoveTime > mouseMoveThrottleTime) {
            lastMouseMoveTime = currentTime; // Update the last handled time
            // Add the mouse position to the queue
            mouseDownQueue.push({ x: event.clientX, y: event.clientY });
            inactivity = 0;
        };
    };
});
// Mouse up event listener to stop adding sand when the mouse button is released
canvas.addEventListener("mouseup", function() {
    mouse_down = false; // Reset when the mouse button is released
});
// Mouse leave event to stop adding sand if the mouse leaves the canvas
canvas.addEventListener("mouseleave", function() {
    mouse_down = false; // Reset if the mouse leaves the canvas area
});

function add_sand(i, j) {
    // Single particles
    // positions_matrix_1[i][j] = colour_value;

    // 3x3 group
    // positions_matrix_1[i+1][j-1] = colour_value;
    // positions_matrix_1[i+1][j] = colour_value;
    // positions_matrix_1[i+1][j+1] = colour_value;

    // positions_matrix_1[i][j-1] = colour_value;
    // positions_matrix_1[i][j] = colour_value;
    // positions_matrix_1[i][j+1] = colour_value;

    // positions_matrix_1[i-1][j-1] = colour_value;
    // positions_matrix_1[i-1][j] = colour_value;
    // positions_matrix_1[i-1][j+1] = colour_value;

    // 5x5 group
    positions_matrix_1[i+2][j+2] = colour_value;
    positions_matrix_1[i+2][j-1] = colour_value;
    positions_matrix_1[i+2][j] = colour_value;
    positions_matrix_1[i+2][j+1] = colour_value;
    positions_matrix_1[i+2][j+2] = colour_value;

    positions_matrix_1[i+1][j+2] = colour_value;
    positions_matrix_1[i+1][j-1] = colour_value;
    positions_matrix_1[i+1][j] = colour_value;
    positions_matrix_1[i+1][j+1] = colour_value;
    positions_matrix_1[i+1][j+2] = colour_value;

    positions_matrix_1[i][j+2] = colour_value;
    positions_matrix_1[i][j-1] = colour_value;
    positions_matrix_1[i][j] = colour_value;
    positions_matrix_1[i][j+1] = colour_value;
    positions_matrix_1[i][j+2] = colour_value;

    positions_matrix_1[i-1][j+2] = colour_value;
    positions_matrix_1[i-1][j-1] = colour_value;
    positions_matrix_1[i-1][j] = colour_value;
    positions_matrix_1[i-1][j+1] = colour_value;
    positions_matrix_1[i-1][j+2] = colour_value;

    positions_matrix_1[i-2][j+2] = colour_value;
    positions_matrix_1[i-2][j-1] = colour_value;
    positions_matrix_1[i-2][j] = colour_value;
    positions_matrix_1[i-2][j+1] = colour_value;
    positions_matrix_1[i-2][j+2] = colour_value;

    // YES I KNOW THIS IS STUPID BUT I WON'T BE FIXING IT NOW!




    draw_canvas(positions_matrix_1);
};
function handle_mousedown_event(event) {
    // Gets mouse position and finds matrix index of where it was clicked, correcting for screen size
    const mouse_x = event.clientX;
    const mouse_y = event.clientY;
    const rect = canvas.getBoundingClientRect();

    const i = Math.round((mouse_y - rect.top) / (rect.height / rows) - 0.5);
    const j = Math.round((mouse_x - rect.left) / (rect.width / columns) - 0.5);

    add_sand(i,j);
};

function time_inactivity() {
    if (inactivity > 200) {
        stop();
    }
    else {
        inactivity = inactivity + 1;
    };
};

let mouseDownQueue = []; // Queue to hold mouse down events
let lastMouseMoveTime = 0; // Track the last time mouse move was handled
const mouseMoveThrottleTime = 50; // Time in milliseconds to throttle mouse move

function main_loop() {
    check_falling_sand();
    set_new_matrices();
    draw_canvas(positions_matrix_1);
    update_colour_value();

    // Process queued mouse down events
    while (mouseDownQueue.length > 0) {

        const { x, y } = mouseDownQueue.shift(); // Get the next event from the queue
        const event = {
            clientX: x,
            clientY: y,
            // If you use any other properties of the event, you can add them here
        };
        handle_mousedown_event(event);
    };

    console.log("looped successfully");

    // Only check for inactivity if the mouse is not down
    if (!mouse_down) {
        time_inactivity();
    };
};

function start(refresh_rate) {
    draw_canvas(positions_matrix_1);
    if (!capture_interval_id) { // Only set a new interval if one is not already running
        capture_interval_id = setInterval(main_loop, refresh_rate);
    };
};

function stop() {
    if (capture_interval_id) {
        clearInterval(capture_interval_id);
        capture_interval_id = null; // Reset the interval ID
    };
};