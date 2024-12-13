var imgurClientId = '9db53e5936cd02f';
/**
 * Parses a text file with the following structure:
 * - Categories start with `#`
 * - Subcategories are enclosed in `()`
 * - Options start with `*`
 * - If an explanation starts with `?` on a new line, it is attached to the last option
 * 
 * @param {string} text - The content of the text file.
 * @returns {object} - A structured object containing categories, subcategories, and options.
 */
function parseFileContent(text) {
    const lines = text.split('\n'); // Split the input text into individual lines
    const result = {}; // Final object to store parsed data
    let currentCategory = null; // Tracks the current category
    let currentSubcategory = null; // Tracks the current subcategory
    let lastOption = null; // Tracks the last option added to allow explanations on new lines

    lines.forEach(line => {
        // Trim white space from the beginning and end of the line
        line = line.trim();

        // Skip empty lines to avoid unnecessary processing
        if (!line) return;

        // Check if the line is a category (line starts with #)
        if (line.startsWith('#')) {
            currentCategory = line.substring(1).trim(); // Extract the category name
            if (!currentCategory) {
                throw new Error('Category name cannot be empty.');
            }
            result[currentCategory] = {}; // Initialize a new category in the result
            currentSubcategory = null; // Reset current subcategory since we have a new category
            lastOption = null; // Reset the last option
        } 
        // Check if the line is a subcategory (line starts and ends with parentheses)
        else if (line.startsWith('(') && line.endsWith(')')) {
            if (currentCategory === null) {
                throw new Error('Subcategory found before a category. Please ensure each subcategory follows a category.');
            }
            currentSubcategory = line.substring(1, line.length - 1).trim(); // Extract the subcategory name
            if (!currentSubcategory) {
                throw new Error('Subcategory name cannot be empty.');
            }
            result[currentCategory][currentSubcategory] = []; // Initialize a new subcategory array in the current category
            lastOption = null; // Reset the last option
        } 
        // Check if the line is an option (line starts with an asterisk *)
        else if (line.startsWith('*')) {
            if (currentCategory === null || currentSubcategory === null) {
                throw new Error('Option found before a subcategory. Please ensure each option is placed under a subcategory.');
            }
            // Extract option text and trim whitespace
            const optionText = line.substring(1).trim();
            if (!optionText) {
                throw new Error('Option text cannot be empty.');
            }

            // Add the option (with no explanation for now) to the subcategory
            const optionObj = {
                option: optionText,
                explanation: null
            };

            result[currentCategory][currentSubcategory].push(optionObj);
            lastOption = optionObj; // Keep track of the last option for explanation reference
        } 
        // Check if the line is an explanation (line starts with a question mark ?)
        else if (line.startsWith('?')) {
            if (!lastOption) {
                throw new Error('Explanation found before an option. Please ensure explanations follow options.');
            }
            // Extract explanation text and trim whitespace
            const explanationText = line.substring(1).trim();
            if (!explanationText) {
                throw new Error('Explanation text cannot be empty.');
            }
            lastOption.explanation = explanationText; // Attach the explanation to the last option
        }
    });

    return result;
}


/**
 * Reads the classic.txt file and parses it using the parseFileContent function.
 */
function readAndParseFile() {
    const filePath = path.join(__dirname, 'classic.txt');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }
        try {
            const parsedData = parseFileContent(data);
            console.log('Parsed Data:', JSON.stringify(parsedData, null, 2));
        } catch (error) {
            console.error('Error parsing file:', error.message);
        }
    });
}



 /**
         * This function takes the parsed JSON data and generates formatted HTML tables for each category.
         * Each category will have its own table, and each subcategory will have its own sub-table with options displayed in rows.
         * 
         * @param {object} jsonData - The parsed JSON data from the classic.txt file.
         */
 function displayFormattedTables(jsonData) {
    const tablesContainer = document.getElementById('tables');
    tablesContainer.innerHTML = ''; // Clear any existing tables

    const radioButtonClasses = ['radio-white', 'radio-blue', 'radio-green', 'radio-yellow', 'radio-red']; // Classes for the 5 radio buttons

    Object.entries(jsonData).forEach(([categoryName, subcategories]) => {
        // Create a container for the category
        const categoryContainer = document.createElement('div');
        categoryContainer.classList.add('category-container');

        // Add a category title
        const categoryTitle = document.createElement('h2');
        categoryTitle.classList.add('category-title');
        categoryTitle.textContent = categoryName;
        categoryContainer.appendChild(categoryTitle);

        // Loop through each subcategory
        Object.entries(subcategories).forEach(([subcategoryName, options]) => {
            // Create a container for the subcategory table
            const subcategoryContainer = document.createElement('div');
            subcategoryContainer.classList.add('subcategory-container');

            // Create a table for each subcategory
            const table = document.createElement('table');

            // Create the subcategory header row
            const thead = document.createElement('thead');
            const subcategoryRow = document.createElement('tr');
            const subcategoryCell = document.createElement('th');
            subcategoryCell.textContent = subcategoryName;
            subcategoryCell.colSpan = 2; // Span across 2 columns to account for 1 radio button cell + 1 option cell
            subcategoryCell.style.backgroundColor = 'silver'; // Silver background for subcategory row
            subcategoryRow.appendChild(subcategoryCell);
            thead.appendChild(subcategoryRow);
            table.appendChild(thead);

            // Create the table body
            const tbody = document.createElement('tbody');

            options.forEach((option, index) => {
                const row = document.createElement('tr');

                // Create a single td for all 5 radio buttons
                const radioCell = document.createElement('td');
                radioCell.classList.add('radio-group-cell'); // Optional: Add a class for further styling if needed

                const radioGroupName = `${categoryName}-${subcategoryName}-option-${index}`; // Group name for the 5 radio buttons
                radioButtonClasses.forEach((radioClass, colorIndex) => {
                    const radioContainer = document.createElement('label');
                    radioContainer.classList.add('radio-container');

                    const radioButton = document.createElement('input');
                    radioButton.type = 'radio';
                    radioButton.name = radioGroupName; // Group name to ensure only one button is selected in the row
                    radioButton.id = `${radioGroupName}-color-${colorIndex}`; // Unique id for each radio button

                    const customRadio = document.createElement('span');
                    customRadio.classList.add('radio-custom', radioClass); // Apply the class for color

                    radioContainer.appendChild(radioButton);
                    radioContainer.appendChild(customRadio);
                    radioCell.appendChild(radioContainer);
                });

                row.appendChild(radioCell); // Add the single td containing all radio buttons to the row

                // Create the option text and explanation button in one cell
                const optionCell = document.createElement('td');
                optionCell.textContent = option.option;

                // Check if the option has an explanation
                if (option.explanation && option.explanation.trim() !== '') {
                    const explanationButton = document.createElement('button');
                    explanationButton.textContent = '?'; // Optional: Show ? symbol instead of text
                    explanationButton.style.marginLeft = '10px'; // Add some space between the option text and button
                    explanationButton.classList.add('show-explanation-btn'); // Add the new class
                    explanationButton.addEventListener('click', () => {
                        alert(option.explanation);
                    });
                    optionCell.appendChild(explanationButton); // Place the button in the same cell as the option
                }
                

                row.appendChild(optionCell); // Add the option cell to the row
                tbody.appendChild(row); // Add the row to the table body
            });

            table.appendChild(tbody);
            subcategoryContainer.appendChild(table);
            categoryContainer.appendChild(subcategoryContainer);
        });

        tablesContainer.appendChild(categoryContainer);
    });
}


document.addEventListener('DOMContentLoaded', function() {
    const radioButtons = document.querySelectorAll('.radio-container input[type="radio"]');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function() {
            const allRadioButtons = document.querySelectorAll(`input[name="${this.name}"]`);
            allRadioButtons.forEach(rb => {
                const customRadio = rb.nextElementSibling;
                if (rb.checked) {
                    customRadio.style.backgroundColor = getVibrantColor(customRadio);
                } else {
                    customRadio.style.backgroundColor = getFadedColor(customRadio);
                }
            });
        });
    });
});

function getVibrantColor(element) {
    if (element.classList.contains('radio-white')) return 'rgba(255, 255, 255, 1)';
    if (element.classList.contains('radio-blue')) return 'rgba(0, 0, 255, 1)';
    if (element.classList.contains('radio-green')) return 'rgba(0, 128, 0, 1)';
    if (element.classList.contains('radio-yellow')) return 'rgba(255, 255, 0, 1)';
    if (element.classList.contains('radio-red')) return 'rgba(255, 0, 0, 1)';
    return '';
}

function getFadedColor(element) {
    if (element.classList.contains('radio-white')) return 'rgba(255, 255, 255, 0.5)';
    if (element.classList.contains('radio-blue')) return 'rgba(0, 0, 255, 0.5)';
    if (element.classList.contains('radio-green')) return 'rgba(0, 128, 0, 0.5)';
    if (element.classList.contains('radio-yellow')) return 'rgba(255, 255, 0, 0.5)';
    if (element.classList.contains('radio-red')) return 'rgba(255, 0, 0, 0.5)';
    return '';
}

/**
 * This function reads and parses the classic.txt file and displays it as formatted tables.
 */
function loadAndParseFile() {
    fetch('classic.txt')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load classic.txt file.');
            }
            return response.text();
        })
        .then(data => {
            const parsedData = parseFileContent(data);
            displayFormattedTables(parsedData);
        })
        .catch(error => console.error('Error loading or parsing file:', error.message));
}

function Export(){
    let jsonfilegenerated = GenerateJSON();

    ExportCanvas(jsonfilegenerated);

}


function GenerateJSON() {
    // **Track data without modifying radio buttons**
    const exportData = [];
    const categoryContainers = document.querySelectorAll('.category-container');

    categoryContainers.forEach(categoryContainer => {
        const categoryName = categoryContainer.querySelector('.category-title').textContent;
        const subcategoryContainers = categoryContainer.querySelectorAll('.subcategory-container');

        subcategoryContainers.forEach(subcategoryContainer => {
            const subcategoryName = subcategoryContainer.querySelector('th').textContent;
            const rows = subcategoryContainer.querySelectorAll('tbody tr');

            rows.forEach(row => {
                const radioButtons = row.querySelectorAll('input[type="radio"]');
                let selectedColor = 'white'; // Default to white if no radio button is selected

                // **Do not change selection, only check which button is selected**
                radioButtons.forEach(radio => {
                    if (radio.checked) {
                        const colorClass = Array.from(radio.nextElementSibling.classList);
                        if (colorClass.includes('radio-blue')) selectedColor = 'blue';
                        else if (colorClass.includes('radio-green')) selectedColor = 'green';
                        else if (colorClass.includes('radio-yellow')) selectedColor = 'yellow';
                        else if (colorClass.includes('radio-red')) selectedColor = 'red';
                        else selectedColor = 'white'; // Default color
                    }
                });

                // Store export data **without modifying UI**
                exportData.push({
                    category: categoryName,
                    subcategory: subcategoryName,
                    option: row.querySelector('td:nth-child(2)').textContent.trim().replace("?",""), // The option text
                    selectedColor: selectedColor
                });
            });
        });
    });

    return exportData; // Display data in console for verification


}



function ExportTest() {
    var username = prompt("Please enter your name");
    if (typeof username !== 'string') return;
    else if (username.length) username = '(' + username + ')';

    // **Track data without modifying radio buttons**
    const exportData = [];
    const categoryContainers = document.querySelectorAll('.category-container');

    categoryContainers.forEach(categoryContainer => {
        const categoryName = categoryContainer.querySelector('.category-title').textContent;
        const subcategoryContainers = categoryContainer.querySelectorAll('.subcategory-container');

        subcategoryContainers.forEach(subcategoryContainer => {
            const subcategoryName = subcategoryContainer.querySelector('th').textContent;
            const rows = subcategoryContainer.querySelectorAll('tbody tr');

            rows.forEach(row => {
                const radioButtons = row.querySelectorAll('input[type="radio"]');
                let selectedColor = 'white'; // Default to white if no radio button is selected

                // **Do not change selection, only check which button is selected**
                radioButtons.forEach(radio => {
                    if (radio.checked) {
                        const colorClass = Array.from(radio.nextElementSibling.classList);
                        if (colorClass.includes('radio-blue')) selectedColor = 'blue';
                        else if (colorClass.includes('radio-green')) selectedColor = 'green';
                        else if (colorClass.includes('radio-yellow')) selectedColor = 'yellow';
                        else if (colorClass.includes('radio-red')) selectedColor = 'red';
                        else selectedColor = 'white'; // Default color
                    }
                });

                // Store export data **without modifying UI**
                exportData.push({
                    category: categoryName,
                    subcategory: subcategoryName,
                    option: row.querySelector('td:nth-child(2)').textContent.trim().replace("?",""), // The option text
                    selectedColor: selectedColor
                });
            });
        });
    });

    console.log('KinkSheet for:', exportData); // Display data in console for verification

    // Optional: Download the export as a file (e.g., JSON file)
    downloadFile(JSON.stringify(exportData, null, 2), 'exported-data.json');

    // Show the loading effect
    const loadingElement = document.getElementById('Loading');
    const urlElement = document.getElementById('URL');
    if (loadingElement) loadingElement.style.display = 'block';
    if (urlElement) urlElement.style.display = 'none';
}

function ExportCanvas(jsonData) {
    var username = prompt("Please enter your name");
    if (typeof username !== 'string') return;
    else if (username.length) username = '(' + username + ')';

    $('#Loading').fadeIn();
    $('#URL').fadeOut();

    // Constants
    var numCols = 6;
    var columnWidth = 250;
    var simpleTitleHeight = 35;
    var rowHeight = 25;
    var radioButtonSize = 10; // Size of the colored radio button
    var legendHeight = 40; // Height of the legend row
    var offsets = {
        left: 10,
        right: 10,
        top: 70, // Adjusted to fit the legend row
        bottom: 10
    };

    // Colors and labels for the legend
    const legendItems = [
        { color: 'rgba(245, 245, 245, 1)', label: 'Not Entered' },
        { color: 'rgba(0, 0, 255, 1)', label: 'Favorite' },
        { color: 'rgba(0, 128, 0, 1)', label: 'Like' },
        { color: 'rgba(255, 255, 0, 1)', label: 'Interested' },
        { color: 'rgba(255, 0, 0, 1)', label: 'No' }
    ];

    // Group the JSON data by category
    var categories = {};
    jsonData.forEach(item => {
        if (!categories[item.category]) {
            categories[item.category] = [];
        }
        categories[item.category].push(item);
    });

    // Calculate total heights and counts
    var numCats = Object.keys(categories).length;
    var numKinks = jsonData.length;
    var simpleCats = numCats;

    var totalHeight = (
        (numKinks * rowHeight) +
        (simpleCats * simpleTitleHeight)
    );

    // Initialize columns and drawStacks
    var columns = [];
    for (var i = 0; i < numCols; i++) {
        columns.push({ height: 0, drawStack: [] });
    }

    // Create draw calls and distribute categories among columns
    var avgColHeight = totalHeight / numCols;
    var columnIndex = 0;

    Object.keys(categories).forEach(categoryName => {
        var items = categories[categoryName];
        var catHeight = simpleTitleHeight + (items.length * rowHeight);

        if ((columns[columnIndex].height + (catHeight / 2)) > avgColHeight) columnIndex++;
        while (columnIndex >= numCols) columnIndex--;
        var column = columns[columnIndex];

        // Draw title for category
        var drawCall = { y: column.height };
        column.drawStack.push(drawCall);
        column.height += simpleTitleHeight;
        drawCall.type = 'simpleTitle';
        drawCall.data = categoryName;

        // Draw each option under this category
        items.forEach(item => {
            var drawCall = {
                y: column.height,
                type: 'kinkRow',
                data: {
                    choices: [item.selectedColor],
                    text: item.option
                }
            };
            column.drawStack.push(drawCall);
            column.height += rowHeight;
        });
    });

    var tallestColumnHeight = 0;
    for (var i = 0; i < columns.length; i++) {
        if (tallestColumnHeight < columns[i].height) {
            tallestColumnHeight = columns[i].height;
        }
    }

    var canvasWidth = offsets.left + offsets.right + (columnWidth * numCols);
    var canvasHeight = offsets.top + offsets.bottom + tallestColumnHeight;

    // Create and set up the canvas
    var canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    var context = canvas.getContext('2d');

    // Draw the background
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    // Add a header (optional)
    context.fillStyle = '#000000';
    context.font = '20px Arial';
    context.fillText('kinkSheet for ' + username, 10, 30);

    // Draw the legend row at the top of the canvas
    var legendX = 10; // X position for the legend
    var legendY = 40; // Y position for the legend
    var xSpacing = 100; // Spacing between each legend item

    legendItems.forEach((item, index) => {
        var circleX = legendX + index * xSpacing; 
        var circleY = legendY; 

        // Draw the colored circle (radio button)
        context.beginPath();
        context.arc(circleX, circleY, radioButtonSize / 2, 0, Math.PI * 2);
        context.fillStyle = item.color;
        context.fill();
        context.strokeStyle = '#000000'; // 1px border for radio button
        context.lineWidth = 1;
        context.stroke();
        context.closePath();

        // Draw the label for each color
        context.font = '14px Arial';
        context.fillStyle = '#000000';
        context.fillText(item.label, circleX + 15, circleY + 5);
    });

    for (var i = 0; i < columns.length; i++) {
        var column = columns[i];
        var drawStack = column.drawStack;

        var drawX = offsets.left + (columnWidth * i);
        for (var j = 0; j < drawStack.length; j++) {
            var drawCall = drawStack[j];
            drawCall.x = drawX;
            drawCall.y += offsets.top;

            if (drawCall.type === 'simpleTitle') {
                context.font = 'bold 18px Arial';
                context.fillStyle = '#000000';
                context.fillText(drawCall.data, drawCall.x, drawCall.y + 20);
            } else if (drawCall.type === 'kinkRow') {
                var color = drawCall.data.choices[0] || '#000000';
                var circleX = drawCall.x + 10;
                var circleY = drawCall.y + 15;

                context.beginPath();
                context.arc(circleX, circleY, radioButtonSize / 2, 0, Math.PI * 2);
                context.fillStyle = color;
                context.fill();
                context.strokeStyle = '#000000';
                context.lineWidth = 1;
                context.stroke();
                context.closePath();

                context.font = '16px Arial';
                context.fillStyle = '#000000';
                context.fillText(drawCall.data.text, circleX + 15, drawCall.y + 20);
            }
        }
    }

    // Send canvas to imgur
    $.ajax({
        url: 'https://api.imgur.com/3/image',
        type: 'POST',
        headers: {
            Authorization: 'Client-ID ' + imgurClientId,
            Accept: 'application/json'
        },
        data: {
            image: canvas.toDataURL().split(',')[1],
            type: 'base64'
        },
        success: function(result) {
            $('#Loading').hide();
            var url = 'https://i.imgur.com/' + result.data.id + '.png';
            $('#URL').val(url).fadeIn();
        },
        fail: function() {
            $('#Loading').hide();
            alert('Failed to upload to imgur, could not connect');
        }
    });
}







/**
 * Utility function to download data as a file
 * @param {string} data - The content to download
 * @param {string} filename - The name of the file
 */
function downloadFile(data, filename) {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}




// Load the file as soon as the page is loaded
document.addEventListener('DOMContentLoaded', loadAndParseFile);

$(document).ready(function() {
    // Attach click and touchstart event listeners to the element with id "Export"
    $('#Export').on('click touchstart', Export);

    // Attach click and touchstart event listeners to the element with id "URL"
    $('#URL').on('click touchstart', function() { 
        this.select(); 
    });
});
