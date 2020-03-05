document.addEventListener('DOMContentLoaded', function(){
    const all_items = items.armor.concat(items.inventory, items.enderchest, items.talisman_bag, items.fishing_bag, items.quiver, items.potion_bag);

    let dimmer = document.querySelector("#dimmer");

    let inventoryContainer = document.querySelector('#inventory_container');

    if(calculated.profile.cute_name == 'Deleted')
        history.replaceState({}, document.title, '/stats/' + calculated.display_name + '/' + calculated.profile.profile_id);
    else
        history.replaceState({}, document.title, '/stats/' + calculated.display_name + '/' + calculated.profile.cute_name);

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

    let currentBackpack;
    let dynamicEnchantedIndex = null;

    function renderInventory(inventory, type){
        let scrollTop = window.pageYOffset;

        if(dynamicEnchantedIndex !== null){
            enchantedOverlays.splice(dynamicEnchantedIndex);
            dynamicEnchantedIndex = null;
        }

        let visibleInventory = document.querySelector('.inventory-view.current-inventory');

        if(visibleInventory){
            visibleInventory.classList.remove('current-inventory');
            document.querySelector('#inventory_container').removeChild(visibleInventory);
        }

        let inventoryView = document.createElement('div');
        inventoryView.className = 'inventory-view current-inventory processed';
        inventoryView.setAttribute('data-inventory-type', type);

        if(type == 'inventory')
            inventory = inventory.slice(9, 36).concat(inventory.slice(0, 9));

        inventory.forEach((item, index) => {
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

                bindLoreEvents(inventoryItem);

                inventoryItem.className = 'rich-item inventory-item';

                if(type == 'backpack')
                    inventoryItem.setAttribute('data-backpack-item-index', index);
                else
                    inventoryItem.setAttribute('data-item-index', item.item_index);

                inventoryItem.appendChild(inventoryItemIcon);

                if(item.Count != 1)
                    inventoryItem.appendChild(inventoryItemCount);

                inventorySlot.appendChild(inventoryItem);
            }

            inventoryView.appendChild(inventorySlot);

            inventoryView.appendChild(document.createTextNode(" "));

            if((index + 1) % 9 == 0)
                inventoryView.appendChild(document.createElement("br"));

            if((index + 1) % 27 == 0 && type == 'inventory')
                inventoryView.appendChild(document.createElement("br"));
        });

        inventoryContainer.appendChild(inventoryView);

        inventoryView.style.height = "auto";
        inventoryView.style.width = "auto";

        if(inventoryView.classList.contains('current-inventory')){
            inventoryContainer.style.width = "auto";
            inventoryContainer.style.height = "auto";
        }

        let width, height;

        if(window.outerWidth <= 1200){
            height = inventoryView.offsetHeight;
            width = window.outerWidth;

            height += 15;
        }else{
            height = inventoryView.offsetHeight;
            width = inventoryView.offsetWidth;
        }

        inventoryView.style.width = width + "px";
        inventoryView.style.height = height + "px";

        inventoryView.classList.add('processed');
        inventoryView.setAttribute('data-height', height + 50 + "px");
        inventoryView.setAttribute('data-width', width + "px");

        if(inventoryView.classList.contains('current-inventory')){
            inventoryContainer.style.width = width + "px";
            inventoryContainer.style.height = height + 50 + "px";
        }

        dynamicEnchantedIndex = enchantedOverlays.length;

        [].forEach.call(inventoryView.querySelectorAll('.item-icon.is-enchanted'), handleEnchanted);

        window.scrollTo({
            top: scrollTop
        });

        let inventoryStatContainer = document.querySelector('.stat-inventory');

        let rect = inventoryStatContainer.getBoundingClientRect();

        if(rect.top < 0 || rect.bottom > window.innerHeight)
            inventoryStatContainer.scrollIntoView({ block: "nearest", behavior: "smooth" });
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

        if(element.hasAttribute('data-item-index'))
            item = all_items.filter(a => a.item_index == Number(element.getAttribute('data-item-index')));
        else if(element.hasAttribute('data-backpack-item-index'))
            item = [currentBackpack.containsItems[Number(element.getAttribute('data-backpack-item-index'))]];
        else if(element.hasAttribute('data-pet-index'))
            item = [calculated.pets[parseInt(element.getAttribute('data-pet-index'))]];

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

        itemLore.innerHTML = item.lore || '';

        if(item.texture_pack){
            let packContent = document.createElement('div');
            packContent.classList.add('pack-credit');

            let packIcon = document.createElement('img');
            packIcon.setAttribute('src', item.texture_pack.base_path + '/pack.png');
            packIcon.classList.add('pack-icon');

            let packName = document.createElement('a');
            packName.setAttribute('href', item.texture_pack.url);
            packName.setAttribute('target', '_blank');
            packName.classList.add('pack-name');
            packName.innerHTML = item.texture_pack.name;

            let packAuthor = document.createElement('div');
            packAuthor.classList.add('pack-author');
            packAuthor.innerHTML = 'by <span>' + item.texture_pack.author + '</span>';

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
                inventorySlot.className = 'inventory-slot backpack-slot';

                if(backpackItem.id){
                    let inventoryItemIcon = document.createElement('div');
                    let inventoryItemCount = document.createElement('div');

                    inventoryItemIcon.className = 'piece-icon item-icon icon-' + backpackItem.id + '_' + backpackItem.Damage;

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

                if((index + 1) % 9 == 0)
                    backpackContents.appendChild(document.createElement("br"));
            });

            let viewBackpack = document.createElement('div');
            viewBackpack.classList = 'view-backpack';

            let viewBackpackText = document.createElement('div');
            viewBackpackText.innerHTML = '<span>View Backpack</span><br><span>(Hold CTRL while clicking backpack to immediately open)</span>';

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
    }

    function resize(){
        [].forEach.call(document.querySelectorAll('.inventory-view'), function(element){
            let width, height;

            element.classList.remove('processed');

            element.style.height = "auto";
            element.style.width = "auto";

            if(element.classList.contains('current-inventory')){
                inventoryContainer.style.width = "auto";
                inventoryContainer.style.height = "auto";
            }

            if(window.outerWidth <= 1200){
                height = element.offsetHeight;
                width = window.outerWidth;

                height += 15;
            }else{
                height = element.offsetHeight;
                width = element.offsetWidth;
            }

            element.style.width = width + "px";
            element.style.height = height + "px";

            element.classList.add('processed');
            element.setAttribute('data-height', height + 50 + "px");
            element.setAttribute('data-width', width + "px");

            if(element.classList.contains('current-inventory')){
                inventoryContainer.style.width = width + "px";
                inventoryContainer.style.height = height + 50 + "px";
            }
        });

        let element = document.querySelector('.rich-item.sticky-stats');

        if(element == null)
            return;

        let maxTop = window.innerHeight - statsContent.offsetHeight - 20;
        let rect = element.getBoundingClientRect();

        if(rect.x)
            statsContent.style.left = rect.x - statsContent.offsetWidth - 10 + "px";

        if(rect.y)
            statsContent.style.top = Math.max(70, Math.min(maxTop, (rect.y + element.offsetHeight / 2) - statsContent.offsetHeight / 2)) + 'px';
    }

    [].forEach.call(document.querySelectorAll('.stat-weapons .select-weapon'), function(element){
        let item_index = element.parentNode.getAttribute('data-item-index');

        let weaponStats = calculated.weapon_stats[item_index];
        let stats;

        element.addEventListener('mousedown', function(e){
            e.preventDefault();
        });

        element.addEventListener('click', function(e){
            if(element.parentNode.classList.contains('piece-selected')){
                element.parentNode.classList.remove("piece-selected");

                stats = calculated.stats;
            }else{
                [].forEach.call(document.querySelectorAll('.stat-weapons .piece'), function(_element){
                    _element.classList.remove("piece-selected");
                });

                element.parentNode.classList.add("piece-selected");

                stats = weaponStats;
            }

            for(let stat in stats){
                let element = document.querySelector('.basic-stat[data-stat=' + stat + '] .stat-value');

                if(!element)
                    continue;

                let currentValue = Number(element.innerHTML);
                let newValue = stats[stat];

                if(newValue != currentValue){
                    anime({
                        targets: '.basic-stat[data-stat=' + stat + '] .stat-value',
                        innerHTML: newValue,
                        backgroundColor: ['rgba(255,255,255,1)', 'rgba(255,255,255,0)'],
                        duration: 500,
                        round: 1,
                        easing: 'easeOutCubic'
                    });
                }
            }
        });
    });

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

    let enchantedOverlays = [];

    function handleEnchanted(element){
        let size = 128;

        let canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;

        canvas.className = 'enchanted-overlay';

        let ctx = canvas.getContext('2d');

        let image = new Image(128, 128);
        let src = window.getComputedStyle(element).backgroundImage.split('("').pop().split('")')[0];

        if(src.endsWith('.gif') || src.includes('/head/'))
            return false;

        image.onload = function(){
            if(element.classList.contains('custom-icon')){
                image = getPart(image, 0, 0, size, size);
            }else{
                let position = window.getComputedStyle(element).backgroundPosition.split(" ");
                let x = Math.abs(parseInt(position[0]));
                let y = Math.abs(parseInt(position[1]));
                image = getPart(image, x, y, size, size);
            }

            ctx.globalAlpha = 1;

            ctx.drawImage(image, 0, 0);

            ctx.globalAlpha = 0.25;
            ctx.globalCompositeOperation = 'source-atop';

            let enchantedGlint = ctx.createLinearGradient(0, 0, 0, canvas.height);

            enchantedGlintStops.forEach(function(stop, index){
                enchantedGlint.addColorStop(stop, enchantedGlintColors[index]);
            });

            ctx.fillStyle = enchantedGlint;

            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if(window.innerWidth < 480){
                element.style.backgroundImage = 'url(' + canvas.toDataURL('image/png') + ')';
                element.classList.add('custom-icon');
            }else{
                element.parentNode.appendChild(canvas);

                enchantedOverlays.push({
                    src,
                    offset: Math.random(),
                    canvas,
                    ctx,
                    image
                });
            }
        };

        image.src = src;
    }

    [].forEach.call(document.querySelectorAll('.item-icon.is-enchanted'), handleEnchanted);

    const enchantedGlintStops = [0, 0.4, 0.6, 1];

    const enchantedGlintColors = [
        '#9e43e3',
        '#ab5ee6',
        '#b875eb',
        '#9e43e3'
    ];

    function updateEnchantedOverlays(){
        enchantedOverlays.forEach(function(overlay, index){
            overlay.ctx.clearRect(0, 0, overlay.canvas.width, overlay.canvas.height);

            overlay.ctx.globalAlpha = 1;
            overlay.ctx.globalCompositeOperation = 'source-over';

            overlay.ctx.drawImage(overlay.image, 0, 0);

            overlay.ctx.globalAlpha = 0.25;
            overlay.ctx.globalCompositeOperation = 'source-atop';

            let offset = +new Date() % 800 / 800 + overlay.offset;

            if(offset > 1)
                offset -= 1;

            let enchantedGlint = overlay.ctx.createLinearGradient(0, 0, 0, overlay.canvas.height);

            enchantedGlintStops.forEach(function(stop, index){
                let _offset = stop - offset;

                if(_offset < 0)
                    _offset = 1 - Math.abs(_offset);

                enchantedGlint.addColorStop(_offset, enchantedGlintColors[index]);
            });

            overlay.ctx.fillStyle = enchantedGlint;

            overlay.ctx.fillRect(0, 0, overlay.canvas.width, overlay.canvas.height);
        });

        window.requestAnimationFrame(updateEnchantedOverlays);
    }

    if(window.innerWidth >= 480) // don't animate on mobile
        updateEnchantedOverlays();

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

    function bindLoreEvents(element){
        element.addEventListener('mouseenter', function(e){
            fillLore(element, false);
            statsContent.classList.add('show-stats');
        });

        element.addEventListener('mouseleave', function(e){
            statsContent.classList.remove('show-stats');
        });

        element.addEventListener('mousemove', function(e){
            if(statsContent.classList.contains('sticky-stats'))
                return;

            let maxTop = window.innerHeight - statsContent.offsetHeight - 20;
            let rect = element.getBoundingClientRect();

            if(rect.x)
                statsContent.style.left = rect.x - statsContent.offsetWidth - 10 + "px";

            let top = Math.max(70, Math.min(maxTop, e.clientY - statsContent.offsetHeight / 2));

            statsContent.style.top = top + "px";
        });

        element.addEventListener('click', function(e){
            if(!e.target.classList.contains('select-weapon')){
                let itemIndex = Number(element.getAttribute('data-item-index'));
                let item = all_items.filter(a => a.item_index == itemIndex);

                if(item.length > 0)
                    item = item[0];

                if(e.ctrlKey && item && Array.isArray(item.containsItems)){
                    showBackpack(item);
                    closeLore();
                }else{
                    if(statsContent.classList.contains('sticky-stats')){
                        dimmer.classList.remove('show-dimmer');
                        element.blur();
                        element.classList.remove('sticky-stats');
                        statsContent.classList.remove('sticky-stats')
                    }else{
                        showLore(element, false);
                        fillLore(element);
                    }
                }
            }
        });
    }

    [].forEach.call(document.querySelectorAll('.rich-item'), bindLoreEvents);

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

    enableApiPlayer.addEventListener('click', function(){
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

    let enterPlayer = document.querySelector('#enter_player');

    enterPlayer.addEventListener('keyup', function(e){
        let playerName = enterPlayer.value;

        if(playerName.trim().length == 0)
            return;

        if(e.keyCode == 13)
            document.location = '/stats/' + playerName;
        else
            document.querySelector('#goto_player').href = '/stats/' + playerName;
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

    window.addEventListener('keydown', function(e){
        let selectedPiece = document.querySelector('.rich-item:focus');

        if(selectedPiece !== null && e.keyCode == 13){
            fillLore(selectedPiece);
            showLore(selectedPiece);
        }

        if(e.keyCode == 27){
            dimmer.classList.remove('show-dimmer');
            enableApiPlayer.classList.remove('show');
            if(document.querySelector('#stats_content.sticky-stats') != null){
                closeLore();
            }
        }

        if(document.querySelector('.rich-item.sticky-stats') != null && e.keyCode == 9)
            e.preventDefault();
    });

    resize();
    window.addEventListener('resize', resize);

    setTimeout(resize, 1000);

    tippy('*[data-tippy-content]')
});
