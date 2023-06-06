import { $, $$ } from '/shield/js/selectors.js'
import { formatDate } from '/shield/js/date-formatting.js'
import { url, user, simpleURL, admins } from '/shield/js/proton.js'
import { countdown } from '/shield/js/countdown.js'
import { commentTemplate } from '/shield/js/comments.js'

// HTML post display template that is used when getPosts is called
export class HTML {
    insertHTML(data) {
        // define some actions, like delete
        let actions = ''
        if (user === data.user || admins.includes(user)) {
            actions = `<button id="delete-${data.id}" class="action-button delete" title="Delete this post"></button>`
        }

        //!data.approved ? actions += `<button id="approve-${data.id}" class="action-button approve" title="Approve this post"></button>` : null

        let pollHTML = ''
        const options = data.options

        let votingDisabled
        let checked
        let deleteBtnTitle
        let disabledColor

        const counter = new countdown
        const closed = counter.count(data.id, data.expires, false)

        let voteBtnText = 'VOTE'
        let closedClass = ''

        if (closed === 'Closed') {
            closedClass = closed
            voteBtnText = 'CLOSED'
        } else {
            closedClass = ''
        }

        if (data.voted && data.voted.includes(user)) {
            voteBtnText = 'VOTED'
        }

        if (closed === 'Closed' || voteBtnText === 'VOTED') {
            checked = 'disabled'
            disabledColor = 'style="color: gray"'
            votingDisabled = 'disabled'
            deleteBtnTitle = 'title="You voted already."'
        } else {
            checked = ''
            disabledColor = ''
            deleteBtnTitle = 'title="Hit the SHIELD to cast your vote."'
        }

        options && options.forEach((post, i) => {
            pollHTML += `<li><input id="post-${data.id}-option-${i}" type="radio" name="post-${data.id}-options" value="${i}" ${checked}/> <label for="post-${data.id}-option-${i}" ${disabledColor}>${post}</label></li>`
        })

        pollHTML = '<ol>' + pollHTML + '</ol>'


        // tags
        const tags = data.tags.split(" ")
        let tagsString = ''
        tags.forEach(post => {
            tagsString += `<a class="tag ${data.type}" href="${simpleURL}?tag=${post}">#${post}</a>`
        })

        // check if we have an image
        let imageSRC
        if (data.image && data.image != '') {
            imageSRC = '/shield/uploads/' + data.image
        } else { imageSRC = '/shield/img/love-technology.jpg' }

        $('body').classList.add('postPage')

        // comments
        const postComments = commentTemplate(data) || ''

        let description = data.description
        description = description.replace(/<script[^>]*>/g, '<code>').replace(/<\/script>/g, '</code>');

        return `
        <article class="post ${closedClass}" id="post-${data.id}">
            <div class="flex">
                <div class="flex justify-start maxw-1111-230">
                    <a class="main-image" href="${imageSRC}" target="_blank">
                        <img class="image" src="${imageSRC}" alt="${data.tags}" />
                        <div class="main-image-username flex-center">
                            <span class="postAvatar avatar" title="Avatar"><img src="/shield/avatars/${data.user}.webp" /></span>
                            <span class="user" title="Username">${data.user}</span>
                        </div>
                    </a>

                    <div class="content">
                        <div class="user_info flex">
                            <span class="${data.type} post-type">${data.type}</span>
                            <b class="${data.type}">#${data.id}</b>
                            <img class="calendar" src="/shield/svgs/calendar.svg" alt="calendar date posted icon" />
                            <span class="date" title="Date posted">` + formatDate(data.date) + `</span>
                            <img class="hourglass" src="/shield/svgs/hourglass.svg" alt="hourglass time left icon" />
                            <span class="countdown" title="Time left (Days : Hours : Minutes)"></span>
                            <span class="actions">${actions}</span>
                        </div>
                        <h1 class="title ${data.type}">${data.title}</h1>
                        <div class="description">
                            <p>${description}</p>
                            <div class="tags">
                                <b>TAGS:</b>
                                <span class="${data.type}">
                                    ${tagsString}
                                </span>
                            </div>
                            <div>
                                <b>VOTING OPTIONS:</b>
                                <span>
                                    ${pollHTML}
                                </span>
                            </div>
                        </div>
                        <div class="comments-section">
                            <h2>Comments</h2>
                            <form id="post-${data.id}-comment" class="submit-comment main-comment-form">
                                <textarea minlength="2" maxlength="1000" required></textarea>
                                <input type="submit" value="Comment" />
                            </form>
                            <div class="comments">${postComments}</div>
                        </div>
                    </div>
                </div>
                <div class="voting" id="voting"><button data-id="${data.id}" class="vote-btn ${data.type}-bg" ${votingDisabled} ${deleteBtnTitle}></button><span>${voteBtnText}</span><canvas class="myChart"></canvas><br><a class="back" href="javascript:history.back()" title="Back"><img class="small-icon invert" alt="back icon" src="/shield/svgs/back.svg" /></a></div>
            </div>
        </article>
        `
    }
}