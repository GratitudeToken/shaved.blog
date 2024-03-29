import { formatDate } from '/shield/js/date-formatting.js'
import { url, user } from '/shield/js/proton.js'
import { countdown } from '/shield/js/countdown.js'

// HTML post display template that is used when getPosts is called
export class indexHTML {
    insertHTML(data) {
        // let approved
        // !data.approved ? approved = 'unapproved' : approved = ''

        // title
        let linkTitle = ''
        if (data && data.title) {
            linkTitle = '?id=' + data.id + '&title=' + data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
        }
        let voted
        let closedStatus = ''
        const counter = new countdown
        const closed = counter.count(data.id, data.expires, false)
        data.voted === false ? voted = false : voted = data.voted.includes(user);

        if (closed === 'Closed') {
            closedStatus = 'post-closed'
        } else if (voted === true) {
            closedStatus = 'post-voted'
        } else { closedStatus = '' }

        // check if we have an image
        let imageSRC
        if (data.image && data.image != '') {
            imageSRC = '/shield/uploads/' + data.image
        } else { imageSRC = '/shield/img/love-technology.jpg' }

        return `
            <article class="post ${data.type} ${closedStatus}" id="post-${data.id}">
                <a href="${linkTitle}" class="flex indexPost" title="${data.title}">
                    <div class="main-image"><img class="image" src="${imageSRC}" alt="${data.tags}" /></div>

                    <div class="content">
                        <div class="flex-space-vertical flex-space-vertical-middle">
                            <div class="title ${data.type}"><h2>${data.title}</h2></div>
                            <div class="user_info flex">
                                <span class="index-user ${data.type}">@${data.user}</span>
                                <img class="calendar" src="/shield/svgs/calendar.svg" alt="calendar date posted icon" />
                                <span class="date" title="Date posted">` + formatDate(data.date) + `</span>
                                <img class="hourglass" src="/shield/svgs/hourglass.svg" alt="hourglass time left icon" />
                                <span class="countdown" title="Time left (Days : Hours : Minutes)"></span>
                            </div>
                        </div>
                    </div>
                </a>
            </article>
            `
    }
}