// do not change 2nd line, logupdater.py changes it
fetch("https://raw.githubusercontent.com/HamletPetrosyan/personal-cp-log/refs/heads/master/log12.json")
.then(result => result.json())
.then(out => fillwebsite(out))
.catch(err => console.log(err))

function formatDate(date) {
    let d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2)
        month = '0' + month;
    if (day.length < 2)
        day = '0' + day;

    return [year, month, day].join('-');
}

function formatLocalDate(date) {
    let d = new Date(date);
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}

const listTitle = document.getElementById("list-title");
const listContent = document.getElementById("list-content");

function pushToList(item, date){
    listContent.innerHTML +=
        `<div class="container list-group-item">
        <div class="d-flex w-100 justify-content-between">
            <div>
                <h5 class="mb-1">${item["name"]}</h5>
                <h6 class="text-body-secondary"><em>${item["source"]}</em></h6>
            </div>
            <div class="text-end">
                <small>${formatLocalDate(date)}</small>
                <br>
                Difficulty: <span class="badge text-bg-secondary">${item["difficulty"]}</span>
                <br>
                Implementation: <span class="badge text-bg-secondary">${item["implementation"]}</span>
            </div>
        </div>`
        + (
            item["tags"].length ? `
        <small><strong>tags:</strong> ${item["tags"].join(", ")}</small>` : ``
        ) + `
    </div>`;
}

function showDailyLog(date, logg) {
    strDate = formatDate(date);
    listContent.innerHTML = '';
    listTitle.innerText = formatLocalDate(date);

    for (let item in logg[strDate]) {
        // console.log(logg[strDate][item]);
        pushToList(logg[strDate][item], date);
    }
}

function showHeatmap(logg) {
    let heatmap_data = [];

    for (let date in logg) {
        // console.log(date);
        heatmap_data.push({
            date: date,
            value: logg[date].length
        });
    }

    // console.log(heatmap_data);

    const heatmap = new CalHeatmap();

    heatmap.paint(
        {
            data: {
                source: heatmap_data,
                x: 'date',
                y: 'value'
            },
            date: {
                start: new Date('2024-11-01'),
            },
            range: Math.max(4, window.innerWidth / 100),
            scale: {
                color: {
                    type: 'linear',
                    scheme: 'Greens',
                    domain: [0, 5],
                },
            },
            domain: {
                type: 'month',
                gutter: 10,
            },
            subDomain: { type: 'day', radius: 5, width: 15, height: 15, color: '#eee'},
            itemSelector: '#ex-wind',
            theme: 'dark'
        },
        [
            [
                Tooltip,
                {
                    text: function (date, value, dayjsDate) {
                        return (
                            (value ? value + ' solved' : 'No data') +
                            ' on ' +
                            dayjsDate.format('LL')
                        );
                    },
                },
            ],
        ]
    );

    heatmap.on('click', (event, timestamp, value) => {
        if(value > 0){
            showDailyLog(timestamp, logg);
        }
    });
}

function searchProblems(text, logg, byName, bySource, byPlatform, byTag){
    // console.log("Search...", byName, bySource, byPlatform, byTag);
    listTitle.innerText = "Search results";
    listContent.innerHTML = "";
    for(let date in logg){
        for(let i in logg[date]){
            if((byName && logg[date][i]["name"].toLowerCase().includes(text)) ||
            (bySource && logg[date][i]["name"].toLowerCase().includes(text)) ||
            (byPlatform && logg[date][i]["name"].toLowerCase().includes(text))){
                pushToList(logg[date][i], date);
            }
            else if (byTag) {
                for(let h in logg[date][i]["tags"]){
                    if(logg[date][i]["tags"][h].toLowerCase().includes(text)){
                        pushToList(logg[date][i], date);
                        break;
                    }
                }
            }
        }
    }
    if(listContent.innerHTML == ""){
        listContent.innerHTML = "no matches";
    }
}

function fillwebsite(logg) {
    // console.log(logg);
    showHeatmap(logg);
    showDailyLog(new Date(), logg);

    document.getElementById("searchForm").addEventListener("submit", function(event) {
        event.preventDefault();
        const searchText = document.getElementById("searchText").value;
        const byName = document.getElementById("searchName").checked;
        const bySource = document.getElementById("searchSource").checked;
        const byPlatform = document.getElementById("searchPlatform").checked;
        const byTag = document.getElementById("searchTag").checked;
        
        if (searchText.trim()) {
            searchProblems(searchText.toLowerCase(), logg, byName, bySource, byPlatform, byTag);
        }
    });
}
