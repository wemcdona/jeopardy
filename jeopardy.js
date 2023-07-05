// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]

let categories = [];


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

function getCategoryIds() {
    return axios.get('http://jservice.io/api/categories?count=6')
    .then(response => {
        const categoryIds = response.data.map(category => category.id);
        return categoryIds;
    })
    .catch(error => {
        console.error('Error', error);
    })
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

function getCategory(catId) {
    return axios.get(`http://jservice.io/api/category?id=${catId}`)
    .then(response => {
        const categoryData = response.data;
        const clues = categoryData.clues.map(clue => {
            return {
                question: clue.question,
                answer: clue.answer,
                showing: null
            };
        });
        return {
            title: categoryData.title,
            clues: clues
        };
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */

async function fillTable() {
    const $board = $('#board');
    const $thead = $board.find('thead');
    const $tbody = $board.find('tbody');

    $thead.empty();
    $tbody.empty();

    const $headRow = $('<tr></tr>');
    for (let category of categories) {
        $headRow.append(`<th>${category.title}</th>`);
    }
    $thead.append($headRow);

    for (let i = 0; i < 5; i++) {
        const $row = $('<tr></tr>');
        for (let category of categories) {
            const $cell = $('<td class="question">?</td>');
            $row.append($cell);
        }
        $tbody.append($row);
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    const $cell = $(evt.target);
    const row = $cell.parent().index();
    const col = $cell.index();
    const clue = categories[col].clues[row];

    if (clue.showing === null) {
        $cell.text(clue.question);
        clue.showing = "question";
    } else if (clue.showing === "question") {
        $cell.text(clue.answer);
        clue.showing = "answer";
    }
}

/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
    const $board = $('#board');
    const $restartButton = $('#restart');

    $board.empty();
    $board.addClass('loading');
    $restartButton.attr('disabled', true);
    $restartButton.text('Loading...');
}

/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
    const $board = $('#board');
    const $restartButton = $('#restart');

    $board.removeClass('loading');
    $restartButton.attr('disabled', false);
    $restartButton. text('Restart');
}

/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    showLoadingView();

    const categoryIds = await getCategoryIds();
    const categoryPromises = categoryIds.map(catId => getCategory(catId));
    categories = await Promise.all(categoryPromises);

    fillTable();

    hideLoadingView();
}

/** On click of start / restart button, set up game. */

$('#restart').on('click', setupAndStart);

/** On page load, add event handler for clicking clues */

$(document).on('click', '.question', handleClick);

// TODO