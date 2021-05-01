class LocalTimeElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.timeElement = document.createElement('time');
        this.shadowRoot.appendChild(this.timeElement);
    }

    static get observedAttributes() {
        return ['timestamp'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'timestamp') {
            if (newValue != undefined) {
                if (!isNaN(newValue)) {
                    newValue = parseInt(newValue);
                }
                const date = new Date(newValue);
                this.timeElement.setAttribute('datetime', date.toISOString())
                this.timeElement.innerHTML = date.toLocaleString(undefined, { dateStyle: "long", timeStyle: "short" });
            } else {
                console.error('local-time must have a timestamp')
            }
        }
    }
}

window.customElements.define('local-time', LocalTimeElement);


document.addEventListener('DOMContentLoaded', function(){

    const favoriteElement = document.querySelector('.favorite');

    if('share' in navigator) {
        iosShareIcon = 'M12,1L8,5H11V14H13V5H16M18,23H6C4.89,23 4,22.1 4,21V9A2,2 0 0,1 6,7H9V9H6V21H18V9H15V7H18A2,2 0 0,1 20,9V21A2,2 0 0,1 18,23Z';
        androidShareIcon = 'M18,16.08C17.24,16.08 16.56,16.38 16.04,16.85L8.91,12.7C8.96,12.47 9,12.24 9,12C9,11.76 8.96,11.53 8.91,11.3L15.96,7.19C16.5,7.69 17.21,8 18,8A3,3 0 0,0 21,5A3,3 0 0,0 18,2A3,3 0 0,0 15,5C15,5.24 15.04,5.47 15.09,5.7L8.04,9.81C7.5,9.31 6.79,9 6,9A3,3 0 0,0 3,12A3,3 0 0,0 6,15C6.79,15 7.5,14.69 8.04,14.19L15.16,18.34C15.11,18.55 15.08,18.77 15.08,19C15.08,20.61 16.39,21.91 18,21.91C19.61,21.91 20.92,20.61 20.92,19A2.92,2.92 0 0,0 18,16.08Z';
        favoriteElement.insertAdjacentHTML('afterend', /*html*/ `
            <button class="additional-player-stat svg-icon">
                <svg viewBox="0 0 24 24">
                    <title>share</title>
                    <path fill="white" d="${navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i) ? iosShareIcon : androidShareIcon}" />
                </svg>
            </button>
        `);
        favoriteElement.nextElementSibling.addEventListener('click', () => {
            navigator.share({
                text: `Check out ${calculated.display_name} on SkyCrypt`,
                url: location.href.split('#')[0],
            });
        })
    }

    function setCookie(name,value,days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days*24*60*60*1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "")  + expires + "; SameSite=Lax; path=/";
    }

    function getCookie(c_name) {
        if (document.cookie.length > 0) {
            c_start = document.cookie.indexOf(c_name + "=");
            if (c_start != -1) {
                c_start = c_start + c_name.length + 1;
                c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) {
                    c_end = document.cookie.length;
                }
                return unescape(document.cookie.substring(c_start, c_end));
            }
        }
        return "";
    }

    let userAgent = window.navigator.userAgent;
    let tippyInstance;

    tippy('*[data-tippy-content]:not(.interactive-tooltip)', {
        trigger: 'mouseenter click'
    });

    const playerModel = document.getElementById("player_model");

    let skinViewer;

    if(playerModel && calculated.skin_data){
        skinViewer = new skinview3d.SkinViewer({
    		width: playerModel.offsetWidth,
    		height: playerModel.offsetHeight,
    		skin: "/texture/" + calculated.skin_data.skinurl.split("/").pop(),
    		cape: 'capeurl' in calculated.skin_data ? "/texture/" + calculated.skin_data.capeurl.split("/").pop() : "/cape/" + calculated.display_name
        });

        playerModel.appendChild(skinViewer.canvas);

    	skinViewer.camera.position.set(-18, -3, 58);

        const controls = new skinview3d.createOrbitControls(skinViewer);

        skinViewer.canvas.removeAttribute("tabindex");

        controls.enableZoom = false;
        controls.enablePan = false;

        /**
         * the average Z rotation of the arms
         */
        const basicArmRotationZ = Math.PI * 0.02;

        /**
         * the average X rotation of the cape
         */
        const basicCapeRotationX = Math.PI * 0.06;

        if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            skinViewer.animations.add((player, time) => {
                // Multiply by animation's natural speed
                time *= 2;

                // Arm swing
                const armRotation = Math.cos(time) * 0.03 + basicArmRotationZ
                player.skin.leftArm.rotation.z = armRotation;
                player.skin.rightArm.rotation.z = armRotation * -1;

                // Cape wave
                player.cape.rotation.x = Math.sin(time) * 0.01 + basicCapeRotationX;
            });
        } else {
            skinViewer.playerObject.skin.leftArm.rotation.z = basicArmRotationZ;
            skinViewer.playerObject.skin.rightArm.rotation.z = basicArmRotationZ * -1;
            skinViewer.playerObject.cape.rotation.x = basicCapeRotationX;
        }

    }

    tippyInstance = tippy('.interactive-tooltip', {
        trigger: 'mouseenter click',
        interactive: true,
        appendTo: () => document.body,
        onTrigger(instance, event){
            if(event.type == 'click')
                dimmer.classList.add('show-dimmer');
        },
        onHide(){
            dimmer.classList.remove('show-dimmer');
        }
    });

    const all_items = items.armor.concat(items.inventory, items.enderchest, items.talisman_bag, items.fishing_bag, items.quiver, items.potion_bag, items.personal_vault, items.wardrobe_inventory);

    let dimmer = document.querySelector("#dimmer");

    let inventoryContainer = document.querySelector('#inventory_container');

    const url = new URL(location);

    url.searchParams.delete('__cf_chl_jschl_tk__');
    url.searchParams.delete('__cf_chl_captcha_tk__');

    if(calculated.profile.cute_name == 'Deleted') {
        url.pathname = `/stats/${calculated.display_name}/${calculated.profile.profile_id}`;
    } else {
        url.pathname = `/stats/${calculated.display_name}/${calculated.profile.cute_name}`;
    }

    history.replaceState({}, document.title, url);

    function isEnchanted(item){
        if(item.animated)
            return false;

        if(item.id == 399)
            return true;

        if('texture_path' in item && item.texture_path.endsWith('.gif')) // disable enchanted overlay for gifs cause laggy
            return false;

        if('id' in item && [403, 384].includes(item.id))
            return true;

        if('tag' in item && Array.isArray(item.tag.ench))
            return true;

        return false;
    };

    function renderLore(text) {
        let output = "";

        let color = null;
        let formats = new Set();

        for (let part of text.match(/(§[0-9a-fk-or])*[^§]*/g)) {

            while (part.charAt(0) === '§') {
                const code = part.charAt(1);

                if (/[0-9a-f]/.test(code)) {
                    color = code;
                } else if (/[k-o]/.test(code)) {
                    formats.add(code);
                } else if (code === 'r') {
                    color = null;
                    formats.clear();
                }

                part = part.substring(2);
            }

            if (part.length === 0) continue;

            output += '<span';

            if (color !== null) {
                output += ` style='color: var(--§${color});'`;
            }

            if (formats.size > 0) {
                output += ` class='${Array.from(formats, x => '§' + x).join(' ')}'`;
            }

            output += `>${part}</span>`;
        }

        const matchingEnchants = constants.special_enchants.filter(a => output.includes(a));

        for (const enchantment of matchingEnchants) {
            if (enchantment == 'Power 6' || enchantment == 'Power 7' && text.startsWith("§8Breaking")) {
                continue;
            }
            output = output.replace(enchantment, `<span style='color: var(--§6)'>${enchantment}</span>`);
        }

        return output;
    }

    let currentBackpack;

    function renderInventory(inventory, type){

        let visibleInventory = document.querySelector('.stat-inventory .inventory-view');

        if(visibleInventory){
            document.querySelector('#inventory_container').removeChild(visibleInventory);
        }

        let inventoryView = document.createElement('div');
        inventoryView.className = 'inventory-view processed';
        inventoryView.setAttribute('data-inventory-type', type);

        let pagesize = 5 * 9;

        if (type === 'inventory') {
            inventory = inventory.slice(9, 36).concat(inventory.slice(0, 9));
            pagesize = 3 * 9;
        } else if (type === 'backpack') {
            pagesize = 6 * 9;
        }

        inventory.forEach(function(item, index){
            let inventorySlot = document.createElement('div');
            inventorySlot.className = 'inventory-slot';

            if(item.id){
                let inventoryItemIcon = document.createElement('div');
                let inventoryItemCount = document.createElement('div');

                inventoryItemIcon.className = 'piece-icon item-icon icon-' + item.id + '_' + item.Damage;

                if(item.texture_path){
                    inventoryItemIcon.className += ' custom-icon';
                    inventoryItemIcon.style.backgroundImage = 'url("' +  item.texture_path + '")';
                }

                if(isEnchanted(item))
                    inventoryItemIcon.classList.add('is-enchanted');

                inventoryItemCount.className = 'item-count';
                inventoryItemCount.innerHTML = item.Count;

                let inventoryItem = document.createElement('div');

                let pieceHoverArea = document.createElement('div');
                pieceHoverArea.className = 'piece-hover-area';

                inventoryItem.className = 'rich-item inventory-item';

                if(type === 'backpack')
                    inventoryItem.setAttribute('data-backpack-item-index', index);
                else
                    inventoryItem.setAttribute('data-item-index', item.item_index);

                inventoryItem.appendChild(inventoryItemIcon);
                inventoryItem.appendChild(pieceHoverArea);

                if(item.Count != 1)
                    inventoryItem.appendChild(inventoryItemCount);

                inventorySlot.appendChild(inventoryItem);

                bindLoreEvents(pieceHoverArea);
            }

            if (index % pagesize === 0 && index !== 0) {
                inventoryView.appendChild(document.createElement("hr"));
            }

            inventoryView.appendChild(inventorySlot);
        });

        inventoryContainer.appendChild(inventoryView);

        [].forEach.call(inventoryView.querySelectorAll('.item-icon.is-enchanted'), handleEnchanted);

        const rect = document.querySelector('#inventory_container').getBoundingClientRect();

        if (rect.top > 100 && rect.bottom > window.innerHeight) {
            let top;
            if (rect.height > window.innerHeight - 100) {
                top = rect.top - 100;
            } else {
                top = rect.bottom - window.innerHeight;
            }
            window.scrollBy({ top, behavior: "smooth" });
            scrollMemory.isSmoothScrolling = true;
        }
    }

    function showBackpack(item){
        let activeInventory = document.querySelector('.inventory-tab.active-inventory');

        if(activeInventory)
            activeInventory.classList.remove('active-inventory');

        renderInventory(item.containsItems, 'backpack');

        currentBackpack = item;
    }

    function fillLore(element){
        let item = [];

        if(element.hasAttribute('data-backpack-index')){
            let backpack = all_items.filter(a => a.item_index == Number(element.getAttribute('data-backpack-index')));

            if(backpack.length == 0)
                return;

            backpack = backpack[0];

            item = backpack.containsItems.filter(a => a.item_index == Number(element.getAttribute('data-item-index')));
        }else if(element.hasAttribute('data-item-index'))
            item = all_items.filter(a => a.item_index == Number(element.getAttribute('data-item-index')));
        else if(element.hasAttribute('data-backpack-item-index'))
            item = [currentBackpack.containsItems[Number(element.getAttribute('data-backpack-item-index'))]];
        else if(element.hasAttribute('data-pet-index'))
            item = [calculated.pets[parseInt(element.getAttribute('data-pet-index'))]];
        else if(element.hasAttribute('data-missing-pet-index'))
            item = [calculated.missingPets[parseInt(element.getAttribute('data-missing-pet-index'))]];
        else if(element.hasAttribute('data-missing-talisman-index'))
            item = [calculated.missingTalismans[parseInt(element.getAttribute('data-missing-talisman-index'))]];

        if(item.length == 0)
            return;

        item = item[0];

        if(element.hasAttribute('data-item-index'))
            statsContent.setAttribute("data-item-index", item.item_index);
        else if(element.hasAttribute('data-backpack-item-index'))
            statsContent.setAttribute("data-backpack-item-index", element.getAttribute('data-backpack-item-index'));
        else if(element.hasAttribute('data-pet-index'))
            statsContent.setAttribute("data-backpack-item-index", element.getAttribute('data-pet-index'));

        itemName.className = 'item-name ' + 'piece-' + (item.rarity || 'common') + '-bg';
        itemNameContent.innerHTML = item.display_name || 'null';

        if(element.hasAttribute('data-pet-index'))
            itemNameContent.innerHTML = `[Lvl ${item.level.level}] ${item.display_name}`;

        if(item.texture_path){
            itemIcon.style.backgroundImage = 'url("' + item.texture_path + '")';
            itemIcon.className = 'stats-piece-icon item-icon custom-icon';
        }else{
            itemIcon.removeAttribute('style');
            itemIcon.classList.remove('custom-icon');
            itemIcon.className = 'stats-piece-icon item-icon icon-' + item.id + '_' + item.Damage;
        }

        /* broken sometimes
        if(isEnchanted(item))
            handleEnchanted(itemIcon);
            */

        itemLore.innerHTML = item.lore || '';

        try{
            if(item.lore != null)
                throw null;

            item.tag.display.Lore.forEach(function(line, index){
                itemLore.innerHTML += renderLore(line);

                if(index + 1 < item.tag.display.Lore.length)
                    itemLore.innerHTML += '<br>';
            });
        }catch(e){

        }

        if(item.texture_pack){
            const texturePack = extra.packs.filter(a => a.id == item.texture_pack)[0];

            const packContent = document.createElement('a');
            packContent.setAttribute('href', item.texture_pack.url);
            packContent.setAttribute('target', '_blank');
            packContent.setAttribute('rel', 'noreferrer');
            packContent.classList.add('pack-credit');

            const packIcon = document.createElement('img');
            packIcon.setAttribute('src', item.texture_pack.base_path + '/pack.png');
            packIcon.classList.add('icon');

            const packName = document.createElement('div');
            packName.classList.add('name');
            packName.innerHTML = item.texture_pack.name;

            const packAuthor = document.createElement('div');
            packAuthor.classList.add('author');
            packAuthor.innerHTML = `by <span>${item.texture_pack.author}</span>`;

            packContent.appendChild(packIcon);
            packContent.appendChild(packName);
            packContent.appendChild(packAuthor);

            itemLore.appendChild(document.createElement('br'));

            itemLore.appendChild(packContent);
        }

        backpackContents.innerHTML = '';

        if(Array.isArray(item.containsItems)){
            backpackContents.classList.add('contains-backpack');

            item.containsItems.forEach((backpackItem, index) => {
                let inventorySlot = document.createElement('div');
                inventorySlot.className = 'inventory-slot';

                if(backpackItem.id){
                    let inventoryItemIcon = document.createElement('div');
                    let inventoryItemCount = document.createElement('div');

                    let enchantedClass = isEnchanted(backpackItem) ? 'is-enchanted' : '';

                    inventoryItemIcon.className = 'piece-icon item-icon ' + enchantedClass + ' icon-' + backpackItem.id + '_' + backpackItem.Damage;

                    if(backpackItem.texture_path){
                        inventoryItemIcon.className += ' custom-icon';
                        inventoryItemIcon.style.backgroundImage = 'url("' + backpackItem.texture_path + '")';
                    }

                    inventoryItemCount.className = 'item-count';
                    inventoryItemCount.innerHTML = backpackItem.Count;

                    let inventoryItem = document.createElement('div');

                    inventoryItem.className = 'inventory-item';

                    inventoryItem.appendChild(inventoryItemIcon);

                    if(backpackItem.Count > 1)
                        inventoryItem.appendChild(inventoryItemCount);

                    inventorySlot.appendChild(inventoryItem);
                }

                backpackContents.appendChild(inventorySlot);

                backpackContents.appendChild(document.createTextNode(" "));
            });

            [].forEach.call(document.querySelectorAll('.contains-backpack .item-icon.is-enchanted'), handleEnchanted);

            let viewBackpack = document.createElement('div');
            viewBackpack.classList = 'view-backpack';

            let viewBackpackText = document.createElement('div');
            viewBackpackText.innerHTML = '<span>View Backpack</span><br><span>(Right click backpack to immediately open)</span>';

            viewBackpack.appendChild(viewBackpackText);

            viewBackpack.addEventListener('click', function(){
                showBackpack(item);
                closeLore();
            });

            backpackContents.appendChild(viewBackpack);
        }else{
            backpackContents.classList.remove('contains-backpack');
        }
    }

    function showLore(element, _resize){
        statsContent.classList.add('sticky-stats');
        element.classList.add('sticky-stats');
        dimmer.classList.add('show-dimmer');

        if(_resize != false)
            resize();
    }

    function closeLore(){
        let shownLore = document.querySelector('#stats_content.show-stats, #stats_content.sticky-stats');

        if(shownLore != null){
            dimmer.classList.remove('show-dimmer');

            let stickyStatsPiece = document.querySelector('.rich-item.sticky-stats');

            if(stickyStatsPiece != null){
                stickyStatsPiece.blur();
                stickyStatsPiece.classList.remove('sticky-stats');
            }

            statsContent.classList.remove('sticky-stats', 'show-stats');
        }

        const openedWardrobe = document.querySelector('.wardrobe-opened');

        if(openedWardrobe)
            openedWardrobe.classList.remove('wardrobe-opened');
    }

    let oldWidth = null;
    let oldheight = null;

    const navBar = document.querySelector('#nav_bar');
    const navBarLinks = navBar.querySelectorAll('.nav-item');
    let navBarHeight;

    function resize(){
        if (playerModel) {
            if(window.innerWidth <= 1570 && (oldWidth === null || oldWidth > 1570))
                document.getElementById("skin_display_mobile").appendChild(playerModel);

            if(window.innerWidth > 1570 && oldWidth <= 1570)
                document.getElementById("skin_display").appendChild(playerModel);
        }

        tippy('*[data-tippy-content]');

        if(playerModel && skinViewer){
            if(playerModel.offsetWidth / playerModel.offsetHeight < 0.6)
                skinViewer.setSize(playerModel.offsetWidth, playerModel.offsetWidth * 2);
            else
                skinViewer.setSize(playerModel.offsetHeight / 2, playerModel.offsetHeight);
        }

        navBarHeight = parseFloat(getComputedStyle(navBar).top);

        let element = document.querySelector('.rich-item.sticky-stats');

        if(element == null)
            return;

        let maxTop = window.innerHeight - statsContent.offsetHeight - 20;
        let rect = element.getBoundingClientRect();

        if(rect.x)
            statsContent.style.left = rect.x - statsContent.offsetWidth - 10 + "px";

        if(rect.y)
            statsContent.style.top = Math.max(70, Math.min(maxTop, (rect.y + element.offsetHeight / 2) - statsContent.offsetHeight / 2)) + 'px';

        oldWidth = window.innerWidth;
        oldHeight = window.innerHeight;
    }

    document.querySelectorAll('.extender').forEach((element) => {
        element.addEventListener('click', () => element.setAttribute('aria-expanded', element.getAttribute('aria-expanded') != 'true'));
    });

    function flashForUpdate(element) {
        element.classList.add('updated');
        element.addEventListener('animationend', () => {
            element.classList.remove('updated');
        });
    }

    [].forEach.call(document.querySelectorAll('.stat-weapons .select-weapon'), function(element){
        let itemId = element.parentNode.getAttribute('data-item-id');
        let filterItems;

        if(element.parentNode.hasAttribute('data-backpack-index')){
            let backpack = all_items.filter(a => a.item_index == Number(element.parentNode.getAttribute('data-backpack-index')));

            if(backpack.length == 0)
                return;

            filterItems = backpack[0].containsItems;
        }else{
             filterItems = items.weapons.filter(a => !('backpackIndex' in a));
        }

        let item = filterItems.filter(a => a.itemId == itemId)[0];

        let weaponStats = calculated.weapon_stats[itemId];
        let stats;

        element.addEventListener('mousedown', function(e){
            e.preventDefault();
        });

        const activeWeaponElement = document.querySelector('.stat-active-weapon');

        element.addEventListener('click', function(e){
            if(element.parentNode.classList.contains('piece-selected')){
                element.parentNode.classList.remove("piece-selected");

                stats = calculated.stats;

                activeWeaponElement.className = 'stat-value stat-active-weapon piece-common-fg';
                activeWeaponElement.innerHTML = 'None';
            }else{
                [].forEach.call(document.querySelectorAll('.stat-weapons .piece'), function(_element){
                    _element.classList.remove("piece-selected");
                });

                element.parentNode.classList.add("piece-selected");

                activeWeaponElement.className = 'stat-value stat-active-weapon piece-' + item.rarity + '-fg';
                activeWeaponElement.innerHTML = item.display_name;

                stats = weaponStats;
            }

            flashForUpdate(activeWeaponElement);

            for(const stat in stats){
                if (stat != 'sea_creature_chance') {
                    updateStat(stat, stats[stat]);
                }
            }
        });
    });

    [].forEach.call(document.querySelectorAll('.stat-fishing .select-rod'), function(element){
        let itemId = element.parentNode.getAttribute('data-item-id');
        let filterItems;

        if(element.parentNode.hasAttribute('data-backpack-index')){
            let backpack = all_items.filter(a => a.item_index == Number(element.parentNode.getAttribute('data-backpack-index')));

            if(backpack.length == 0)
                return;

            filterItems = backpack[0].containsItems;
        }else{
             filterItems = items.rods.filter(a => !('backpackIndex' in a));
        }

        let item = filterItems.filter(a => a.itemId == itemId)[0];

        let weaponStats = calculated.weapon_stats[itemId];
        let stats;

        element.addEventListener('mousedown', function(e){
            e.preventDefault();
        });

        const activeRodElement = document.querySelector('.stat-active-rod');

        element.addEventListener('click', function(e){
            if(element.parentNode.classList.contains('piece-selected')){
                element.parentNode.classList.remove("piece-selected");

                stats = calculated.stats;

                activeRodElement.className = 'stat-value stat-active-rod piece-common-fg';
                activeRodElement.innerHTML = 'None';
            }else{
                [].forEach.call(document.querySelectorAll('.stat-fishing .piece'), function(_element){
                    _element.classList.remove("piece-selected");
                });

                element.parentNode.classList.add("piece-selected");

                activeRodElement.className = 'stat-value stat-active-rod piece-' + item.rarity + '-fg';
                activeRodElement.innerHTML = item.display_name;

                stats = weaponStats;
            }

            flashForUpdate(activeRodElement);

            updateStat('sea_creature_chance', stats.sea_creature_chance);
        });
    });

    function updateStat(stat, newValue) {
        const elements = document.querySelectorAll('.basic-stat[data-stat=' + stat + '] .stat-value');

        for (const element of elements) {
            const currentValue = parseFloat(element.innerHTML.replaceAll(',', ''));

            if (newValue != currentValue) {
                element.innerHTML = newValue.toLocaleString();
                flashForUpdate(element);
            }
        }
    }

    function getPart(src, x, y, width, height){
        let dst = document.createElement('canvas');
        dst.width = width;
        dst.height = height;

        let ctx = dst.getContext("2d");

        // don't blur on resize
        ctx.imageSmoothingEnabled = false;

        ctx.drawImage(src, x, y, width, height, 0, 0, (width - src.width) / 2 + width, (height - src.height) / 2 + height);
        return dst;
    }

    function handleEnchanted(element){
        let size = 128;

        let canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        let ctx = canvas.getContext('2d');

        let src = window.getComputedStyle(element).backgroundImage.split('("').pop().split('")')[0];
        let image = new Image(128, src.includes('/head/') ? 118 : 128);

        if(src.endsWith('.gif'))
            return false;

        image.onload = function(){
            if(!element.classList.contains('custom-icon')){
                let position = window.getComputedStyle(element).backgroundPosition.split(" ");
                let x = Math.abs(parseInt(position[0]));
                let y = Math.abs(parseInt(position[1]));
                image = getPart(image, x, y, size, size);
            }

            ctx.globalAlpha = 1;

            ctx.drawImage(image, 0, 128 / 2 - image.height / 2);

            ctx.globalAlpha = 0.5;
            ctx.globalCompositeOperation = 'source-atop';

            ctx.drawImage(enchantedGlint, 0, 0, canvas.width, canvas.height);

            element.style.backgroundImage = 'url(' + canvas.toDataURL('image/png') + ')';
            element.classList.add('custom-icon');
        };

        image.src = src;
    }

    let enchantedGlint = new Image(128, 128);

    enchantedGlint.onload = function(){
        [].forEach.call(document.querySelectorAll('.item-icon.is-enchanted'), handleEnchanted);
    }

    enchantedGlint.src = '/resources/img/glint.png';

    [].forEach.call(document.querySelectorAll('.inventory-tab'), function(element){
        let type = element.getAttribute('data-inventory-type');

        element.addEventListener('click', function(){
            if(element.classList.contains('active-inventory'))
                return;

            let activeInventory = document.querySelector('.inventory-tab.active-inventory');

            if(activeInventory)
                activeInventory.classList.remove('active-inventory');

            element.classList.add('active-inventory');

            renderInventory(items[type], type);
        });
    });

    const statsContent = document.querySelector('#stats_content');
    const itemName = statsContent.querySelector('.item-name');
    const itemIcon = itemName.querySelector('div:first-child');
    const itemNameContent = itemName.querySelector('span');
    const itemLore = statsContent.querySelector('.item-lore');
    const backpackContents = statsContent.querySelector('.backpack-contents');

    const touchDevice = window.matchMedia("(pointer: coarse)").matches;

    function bindWardrobeEvents(element){
        element.addEventListener('click', function(e){
            const currentWardrobe = document.querySelector('.wardrobe-opened');

            if(currentWardrobe)
                currentWardrobe.classList.remove('wardrobe-opened');

            element.classList.add('wardrobe-opened');
        });
    }

    function bindLoreEvents(element){
        element.addEventListener('mouseenter', function(e){
            fillLore(element.parentNode, false);

            if(touchDevice && element.parentNode.classList.contains('wardrobe-piece') && !element.parentNode.parentNode.classList.contains('wardrobe-opened'))
                return;

            statsContent.classList.add('show-stats');
        });

        element.addEventListener('mouseleave', function(e){
            statsContent.classList.remove('show-stats');
            element.classList.remove('piece-hovered');
        });

        element.addEventListener('mousemove', function(e){
            if(statsContent.classList.contains('sticky-stats'))
                return;

            let maxTop = window.innerHeight - statsContent.offsetHeight - 20;
            let rect = element.getBoundingClientRect();

            let left = rect.x - statsContent.offsetWidth - 10;

            if(left < 10)
                left = rect.x + 90;

            if(rect.x)
                statsContent.style.left = left + 'px';

            let top = Math.max(70, Math.min(maxTop, e.clientY - statsContent.offsetHeight / 2));

            statsContent.style.top = top + "px";
        });

        const itemIndex = Number(element.parentNode.getAttribute('data-item-index'));
        let item = all_items.filter(a => a.item_index == itemIndex);

        if(item.length > 0)
            item = item[0];

        if(item && Array.isArray(item.containsItems)){
            element.parentNode.addEventListener('contextmenu', function(e){
                e.preventDefault();

                showBackpack(item);
                closeLore();
            });
        }

        element.addEventListener('click', function(e){
            if(touchDevice && element.parentNode.classList.contains('wardrobe-piece') && !element.parentNode.parentNode.classList.contains('wardrobe-opened')){
                element.parentNode.blur();
                return;
            }

            if(element.parentNode.parentNode.classList.contains('wardrobe-set'))
                element.parentNode.parentNode.classList.add('wardrobe-opened');

            if(e.ctrlKey && item && Array.isArray(item.containsItems)){
                showBackpack(item);
                closeLore();
            }else{
                if(statsContent.classList.contains('sticky-stats')){
                    closeLore();
                }else{
                    showLore(element.parentNode, false);

                    if(Number(statsContent.getAttribute('data-item-index')) != itemIndex)
                        fillLore(element.parentNode);
                }
            }
        });
    }

    if(touchDevice)
        [].forEach.call(document.querySelectorAll('.wardrobe-set'), bindWardrobeEvents);

    [].forEach.call(document.querySelectorAll('.rich-item .piece-hover-area'), bindLoreEvents);

    let enableApiPlayer = document.querySelector('#enable_api');

    [].forEach.call(document.querySelectorAll('.enable-api'), function(element){
        element.addEventListener('click', function(e){
            e.preventDefault();
            dimmer.classList.add('show-dimmer');
            enableApiPlayer.classList.add('show');

            enableApiPlayer.currentTime = 0;
            enableApiPlayer.play();
        });
    });

    enableApiPlayer.addEventListener('click', function(event) {
        event.stopPropagation();
        if(enableApiPlayer.paused)
            enableApiPlayer.play();
        else
            enableApiPlayer.pause();
    });

    dimmer.addEventListener('click', function(e){
        dimmer.classList.remove('show-dimmer');
        enableApiPlayer.classList.remove('show');

        closeLore();
    });

    [].forEach.call(document.querySelectorAll('.close-lore'), function(element){
        element.addEventListener('click', closeLore);
    });

    [].forEach.call(document.querySelectorAll('.copy-text'), function(e){
        let element = e;

        let copyNotification = tippy(element, {
          content: 'Copied to clipboard!',
          trigger: 'manual'
        });

        element.addEventListener('click', function(){
            navigator.clipboard.writeText(element.getAttribute("data-copy-text")).then(function(){
                copyNotification.show();

                setTimeout(function(){
                    copyNotification.hide();
                }, 1500);
            }, function(){});
        });
    });

    function parseFavorites(cookie) {
        return cookie?.split(',').filter(uuid => /^[0-9a-f]{32}$/.test(uuid)) || [];
    }

    function checkFavorite() {
        const favorited = parseFavorites(getCookie("favorite")).includes(favoriteElement.getAttribute("data-username"));
        favoriteElement.setAttribute('aria-checked', favorited);
        return favorited;
    }

    let favoriteNotification = tippy(favoriteElement, {
        trigger: 'manual'
    });

    favoriteElement.addEventListener('click', function(){
        let uuid = favoriteElement.getAttribute("data-username");
        if(uuid == "0c0b857f415943248f772164bf76795c"){
            favoriteNotification.setContent("No");
        }else{
            let cookieArray = parseFavorites(getCookie("favorite"));
            if(cookieArray.includes(uuid)){
                cookieArray.splice(cookieArray.indexOf(uuid), 1);

                favoriteNotification.setContent("Removed favorite!");
            }else if(cookieArray.length >= constants.max_favorites){
                favoriteNotification.setContent(`You can only have ${constants.max_favorites} favorites!`);
            }else{
                cookieArray.push(uuid);

                favoriteNotification.setContent("Added favorite!");
            }
            setCookie("favorite", cookieArray.join(','), 365);
            checkFavorite();
        }
        favoriteNotification.show();

        setTimeout(function(){
            favoriteNotification.hide();
        }, 1500);
    });

    let socialsShown = false;
    let revealSocials = document.querySelector('#reveal_socials');

    if(revealSocials){
        revealSocials.addEventListener('click', function(){
            if(socialsShown){
                socialsShown = false;
                document.querySelector('#additional_socials').classList.remove('socials-shown');
                document.querySelector('#reveal_socials').classList.remove('socials-shown');
            }else{
                socialsShown = true;
                document.querySelector('#additional_socials').classList.add('socials-shown');
                document.querySelector('#reveal_socials').classList.add('socials-shown');
            }
        });
    }

    class ScrollMemory {
        _isSmoothScrolling = false;
        _scrollTimeout = -1;
        _loaded = false;

        constructor() {


            window.addEventListener('load', () => {
                this._loaded = true;
                this.isSmoothScrolling = true;
            }, { once: true });

            window.addEventListener("hashchange", () => {
                this.isSmoothScrolling = true;
            });

            document.addEventListener('focusin', () => {
                this.isSmoothScrolling = true;
            });
        }

        /** wether the document currently has a smooth scroll taking place */
        get isSmoothScrolling() {
            return this._isSmoothScrolling || !this._loaded;
        }

        set isSmoothScrolling(value) {
            if (this._isSmoothScrolling !== value) {
                this._isSmoothScrolling = value;
                if (value) {
                    window.addEventListener('scroll', this._onScroll);
                    this._onScroll();
                } else {
                    window.removeEventListener('scroll', this._onScroll);
                    scrollToTab();
                }   
            }
        }

        _onScroll = () => {
            clearTimeout(this._scrollTimeout);
            this._scrollTimeout = setTimeout(() => {
                this.isSmoothScrolling = false;
            }, 500);
        }
    }

    const scrollMemory = new ScrollMemory();

    const intersectingElements = new Map();    

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        for (const entry of entries) {
            intersectingElements.set(entry.target, entry.isIntersecting);
        }
        for (const [element, isIntersecting] of intersectingElements) {
            if (isIntersecting) {
                let newHash;
                if (element !== playerProfileElement) {
                    newHash = '#' + element.parentElement.querySelector('a[id]').id;
                    history.replaceState({}, document.title, newHash);
                } else {
                    history.replaceState({}, document.title, location.href.split('#')[0]);
                }
                for (const link of navBarLinks) {
                    if (link.hash === newHash) {
                        link.setAttribute('aria-current', true);
                        
                        if (!scrollMemory.isSmoothScrolling) {
                            scrollToTab(true, link);
                        }
                    } else {
                        link.removeAttribute('aria-current');
                    }
                }
                break;
            }
        }
    }, {rootMargin: "-100px 0px -25% 0px"});

    function scrollToTab(smooth = true, element) {
        const link = element ?? document.querySelector(`[href="${location.hash}"]`);
        const behavior = smooth ? 'smooth' : 'auto';
        const left = link.offsetLeft + (link.getBoundingClientRect().width / 2) - (link.parentElement.getBoundingClientRect().width / 2);
        link.parentElement.scrollTo({ left, behavior });
    }

    scrollToTab(false);

    const playerProfileElement = document.querySelector('#player_profile');

    sectionObserver.observe(playerProfileElement);

    document.querySelectorAll('.stat-header').forEach((element) => {
        sectionObserver.observe(element);
    });

    let otherSkills = document.querySelector('#other_skills');
    let showSkills = document.querySelector("#show_skills");

    if(showSkills != null){
        showSkills.addEventListener('click', function(){
            if(otherSkills.classList.contains('show-skills')){
                otherSkills.classList.remove('show-skills');
                showSkills.innerHTML = 'Show Skills';
            }else{
                otherSkills.classList.add('show-skills');
                show_skills.innerHTML = 'Hide Skills';
            }
        });
    }

    [].forEach.call(document.querySelectorAll('.xp-skill'), function(element){
        let skillProgressText = element.querySelector('.skill-progress-text');

        if(skillProgressText === null)
            return;

        let originalText = skillProgressText.innerHTML;

        element.addEventListener('mouseenter', function(){
            skillProgressText.innerHTML = skillProgressText.getAttribute('data-hover-text');
        });

        element.addEventListener('mouseleave', function(){
            skillProgressText.innerHTML = originalText;
        });
    });

    [].forEach.call(document.querySelectorAll('.kills-deaths-container .show-all.enabled'), function(element){
        let parent = element.parentNode;
        let kills = calculated[element.getAttribute('data-type')];

        element.addEventListener('click', function(){
            parent.style.maxHeight = parent.offsetHeight + 'px';
            parent.classList.add('all-shown');
            element.remove();

            kills.slice(10).forEach(function(kill, index){
                let killElement = document.createElement('div');
                let killRank = document.createElement('div');
                let killEntity = document.createElement('div');
                let killAmount = document.createElement('div');
                let statSeparator = document.createElement('div');

                killElement.className = 'kill-stat';
                killRank.className = 'kill-rank';
                killEntity.className = 'kill-entity';
                killAmount.className = 'kill-amount';
                statSeparator.className = 'stat-separator';

                killRank.innerHTML = '#' + (index + 11) + '&nbsp;';
                killEntity.innerHTML = kill.entityName;
                killAmount.innerHTML = kill.amount.toLocaleString();
                statSeparator.innerHTML = ':&nbsp;';

                killElement.appendChild(killRank);
                killElement.appendChild(killEntity);
                killElement.appendChild(statSeparator);
                killElement.appendChild(killAmount);

                parent.appendChild(killElement);
            });
        });
    });

    window.addEventListener('keydown', function(e){
        let selectedPiece = document.querySelector('.rich-item:focus');

        if(selectedPiece !== null && e.key === 'Enter'){
            fillLore(selectedPiece);
            showLore(selectedPiece);
        }

        if (e.key === 'Escape'){
            dimmer.classList.remove('show-dimmer');
            enableApiPlayer.classList.remove('show');
            if(document.querySelector('#stats_content.sticky-stats') != null){
                closeLore();
            }
        }

        if(document.querySelector('.rich-item.sticky-stats') != null && e.key === 'Tab')
            e.preventDefault();
    });

    resize();

    window.addEventListener('resize', resize);

    function onScroll() {
        if (navBar.getBoundingClientRect().top <= navBarHeight ) {
            navBar.classList.add('stuck')
        } else {
            navBar.classList.remove('stuck')
        }
    }
    onScroll();
    window.addEventListener('scroll', onScroll);

    setTimeout(resize, 1000);
});
