class EvilSpiritGame {
    constructor() {
        this.gameState = 'start';
        this.selectedMember = null;
        this.player = {
            x: 400,
            y: 300,
            hp: 100,
            maxHp: 100,
            mp: 50,
            maxMp: 50,
            score: 0,
            speed: 5
        };
        this.enemies = [];
        this.effects = [];
        this.keys = {};
        this.gameTime = 0;
        this.lastSpawn = 0;
        this.spawnRate = 2000;
        this.gameLoop = null;
        
        // 모바일 컨트롤
        this.joystick = {
            active: false,
            centerX: 0,
            centerY: 0,
            knobX: 0,
            knobY: 0
        };
        
        this.members = [
            {
                id: 'fire',
                name: '화염술사 (애쉬)',
                emoji: '🔥',
                ability: '화염구',
                description: '강력한 화염구로 적들을 불태웁니다',
                damage: 30,
                range: 150,
                cooldown: 3000,
                mpCost: 15
            },
            {
                id: 'ice',
                name: '빙결술사 (스피)',
                emoji: '❄️',
                ability: '얼음폭풍',
                description: '주변 적들을 얼려 움직임을 봉쇄합니다',
                damage: 20,
                range: 200,
                cooldown: 4000,
                mpCost: 20
            },
            {
                id: 'lightning',
                name: '뇌전술사 (로보 케일)',
                emoji: '⚡',
                ability: '번개 체인',
                description: '번개가 적들 사이를 연쇄적으로 타격합니다',
                damage: 25,
                range: 180,
                cooldown: 2500,
                mpCost: 12
            },
            {
                id: 'holy',
                name: '성직자 (루네)',
                emoji: '✨',
                ability: '신성한 빛',
                description: '악귀들에게 치명적인 성스러운 빛을 발산합니다',
                damage: 35,
                range: 120,
                cooldown: 3500,
                mpCost: 18
            },
            {
                id: 'shadow',
                name: '그림자 암살자 (히봄)',
                emoji: '🌙',
                ability: '그림자 베기',
                description: '순간이동하여 적을 기습 공격합니다',
                damage: 40,
                range: 100,
                cooldown: 2000,
                mpCost: 10
            },
            {
                id: 'earth',
                name: '대지술사 (유르)',
                emoji: '🌍',
                ability: '지진',
                description: '대지를 흔들어 광범위한 피해를 입힙니다',
                damage: 28,
                range: 250,
                cooldown: 5000,
                mpCost: 25
            },
            {
                id: 'wind',
                name: '바람술사 (라꾼)',
                emoji: '💨',
                ability: '회오리바람',
                description: '회오리바람으로 적들을 휩쓸어버립니다',
                damage: 22,
                range: 180,
                cooldown: 3000,
                mpCost: 15
            },
            {
                id: 'psychic',
                name: '염력술사 (밤볼라)',
                emoji: '🧠',
                ability: '정신파동',
                description: '강력한 정신력으로 적들을 밀어냅니다',
                damage: 26,
                range: 200,
                cooldown: 2800,
                mpCost: 16
            },
            {
                id: 'poison',
                name: '독술사 (예원)',
                emoji: '☠️',
                ability: '독구름',
                description: '독구름을 생성하여 지속적인 피해를 입힙니다',
                damage: 24,
                range: 160,
                cooldown: 3200,
                mpCost: 14
            }
        ];
        
        this.lastAbilityUse = 0;
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showScreen('startScreen');
        this.createMemberCards();
    }
    
    setupEventListeners() {
        // 버튼 이벤트
        document.getElementById('startBtn').addEventListener('click', () => {
            this.showScreen('memberScreen');
        });
        
        document.getElementById('howToPlayBtn').addEventListener('click', () => {
            this.showScreen('howToPlayScreen');
        });
        
        document.getElementById('backToStartFromGuide').addEventListener('click', () => {
            this.showScreen('startScreen');
        });
        
        document.getElementById('backToStart').addEventListener('click', () => {
            this.showScreen('startScreen');
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.resetGame();
            this.showScreen('memberScreen');
        });
        
        document.getElementById('backToMenuBtn').addEventListener('click', () => {
            this.resetGame();
            this.showScreen('startScreen');
        });
        
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            // 키 코드와 키 이름 모두 저장
            this.keys[e.key.toLowerCase()] = true;
            this.keys[e.code.toLowerCase()] = true;
            
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                this.useAbility();
            }
            
            // 게임 중일 때 기본 동작 방지
            if (this.gameState === 'playing' && 
                (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
                 e.key === 'ArrowLeft' || e.key === 'ArrowRight' ||
                 e.key.toLowerCase() === 'w' || e.key.toLowerCase() === 's' ||
                 e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'd')) {
                e.preventDefault();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
            this.keys[e.code.toLowerCase()] = false;
        });
        
        // 모바일 컨트롤
        this.setupMobileControls();
        
        // 능력 버튼
        document.getElementById('abilityBtn').addEventListener('click', () => {
            this.useAbility();
        });
        
        document.getElementById('abilityMobileBtn').addEventListener('click', () => {
            this.useAbility();
        });
        
        document.getElementById('attackBtn').addEventListener('click', () => {
            this.basicAttack();
        });
    }
    
    setupMobileControls() {
        const joystick = document.getElementById('joystick');
        const knob = joystick.querySelector('.joystick-knob');
        
        const handleStart = (e) => {
            e.preventDefault();
            this.joystick.active = true;
            const rect = joystick.getBoundingClientRect();
            this.joystick.centerX = rect.left + rect.width / 2;
            this.joystick.centerY = rect.top + rect.height / 2;
        };
        
        const handleMove = (e) => {
            if (!this.joystick.active) return;
            e.preventDefault();
            
            const touch = e.touches ? e.touches[0] : e;
            const deltaX = touch.clientX - this.joystick.centerX;
            const deltaY = touch.clientY - this.joystick.centerY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const maxDistance = 30;
            
            if (distance <= maxDistance) {
                this.joystick.knobX = deltaX;
                this.joystick.knobY = deltaY;
            } else {
                this.joystick.knobX = (deltaX / distance) * maxDistance;
                this.joystick.knobY = (deltaY / distance) * maxDistance;
            }
            
            knob.style.transform = `translate(calc(-50% + ${this.joystick.knobX}px), calc(-50% + ${this.joystick.knobY}px))`;
        };
        
        const handleEnd = (e) => {
            e.preventDefault();
            this.joystick.active = false;
            this.joystick.knobX = 0;
            this.joystick.knobY = 0;
            knob.style.transform = 'translate(-50%, -50%)';
        };
        
        // 터치 이벤트
        joystick.addEventListener('touchstart', handleStart);
        document.addEventListener('touchmove', handleMove);
        document.addEventListener('touchend', handleEnd);
        
        // 마우스 이벤트 (데스크톱 테스트용)
        joystick.addEventListener('mousedown', handleStart);
        document.addEventListener('mousemove', handleMove);
        document.addEventListener('mouseup', handleEnd);
    }
    
    createMemberCards() {
        const memberGrid = document.getElementById('memberGrid');
        memberGrid.innerHTML = '';
        
        this.members.forEach(member => {
            const card = document.createElement('div');
            card.className = 'member-card';
            card.innerHTML = `
                <div class="member-avatar">${member.emoji}</div>
                <div class="member-name">${member.name}</div>
                <div class="member-ability">${member.ability}</div>
                <div class="member-description">${member.description}</div>
            `;
            
            card.addEventListener('click', () => {
                this.selectMember(member);
            });
            
            memberGrid.appendChild(card);
        });
    }
    
    selectMember(member) {
        this.selectedMember = member;
        this.player.mp = member.mpCost * 3; // 시작 MP 설정
        this.player.maxMp = member.mpCost * 3;
        this.startGame();
    }
    
    startGame() {
        this.gameState = 'playing';
        this.showScreen('gameScreen');
        this.resetGame();
        this.updateUI();
        this.gameLoop = setInterval(() => this.update(), 16); // 60 FPS
    }
    
    resetGame() {
        this.player.x = 400;
        this.player.y = 300;
        this.player.hp = 100;
        this.player.maxHp = 100;
        this.player.score = 0;
        this.enemies = [];
        this.effects = [];
        this.gameTime = 0;
        this.lastSpawn = 0;
        this.lastAbilityUse = 0;
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.gameTime += 16;
        this.handleInput();
        this.spawnEnemies();
        this.updateEnemies();
        this.updateEffects();
        this.checkCollisions();
        this.updateUI();
        this.regenerateMP();
        
        if (this.player.hp <= 0) {
            this.gameOver();
        }
    }
    
    handleInput() {
        const gameArea = document.getElementById('gameArea');
        const rect = gameArea.getBoundingClientRect();
        
        let moveX = 0;
        let moveY = 0;
        
        // 키보드 입력 - 다양한 키 형태 모두 확인
        if (this.keys['w'] || this.keys['W'] || this.keys['arrowup'] || this.keys['keyw']) moveY -= 1;
        if (this.keys['s'] || this.keys['S'] || this.keys['arrowdown'] || this.keys['keys']) moveY += 1;
        if (this.keys['a'] || this.keys['A'] || this.keys['arrowleft'] || this.keys['keya']) moveX -= 1;
        if (this.keys['d'] || this.keys['D'] || this.keys['arrowright'] || this.keys['keyd']) moveX += 1;
        
        // 조이스틱 입력
        if (this.joystick.active) {
            moveX += this.joystick.knobX / 30;
            moveY += this.joystick.knobY / 30;
        }
        
        // 이동 처리
        if (moveX !== 0 || moveY !== 0) {
            const length = Math.sqrt(moveX * moveX + moveY * moveY);
            moveX = (moveX / length) * this.player.speed;
            moveY = (moveY / length) * this.player.speed;
            
            this.player.x = Math.max(20, Math.min(rect.width - 20, this.player.x + moveX));
            this.player.y = Math.max(20, Math.min(rect.height - 20, this.player.y + moveY));
            
            this.updatePlayerPosition();
        }
    }
    
    updatePlayerPosition() {
        const playerElement = document.getElementById('player');
        playerElement.style.left = this.player.x - 20 + 'px';
        playerElement.style.top = this.player.y - 20 + 'px';
    }
    
    spawnEnemies() {
        if (this.gameTime - this.lastSpawn > this.spawnRate) {
            this.spawnEnemy();
            this.lastSpawn = this.gameTime;
            
            // 시간이 지날수록 스폰 속도 증가
            if (this.spawnRate > 500) {
                this.spawnRate -= 10;
            }
        }
    }
    
    spawnEnemy() {
        const gameArea = document.getElementById('gameArea');
        const rect = gameArea.getBoundingClientRect();
        
        const type = Math.random() < 0.7 ? 'spirit' : 'monster';
        const enemy = {
            id: Date.now() + Math.random(),
            type: type,
            x: Math.random() * rect.width,
            y: Math.random() < 0.5 ? -50 : rect.height + 50,
            hp: type === 'spirit' ? 20 : 40,
            maxHp: type === 'spirit' ? 20 : 40,
            speed: type === 'spirit' ? 2 : 1.5,
            damage: type === 'spirit' ? 15 : 25,
            points: type === 'spirit' ? 10 : 25
        };
        
        this.enemies.push(enemy);
        this.createEnemyElement(enemy);
    }
    
    createEnemyElement(enemy) {
        const gameArea = document.getElementById('gameArea');
        const element = document.createElement('div');
        element.id = `enemy-${enemy.id}`;
        element.className = enemy.type === 'spirit' ? 'evil-spirit' : 'monster';
        element.style.left = enemy.x - 20 + 'px';
        element.style.top = enemy.y - 25 + 'px';
        
        // 악귀에 눈과 입 추가
        if (enemy.type === 'spirit') {
            const eyes = document.createElement('div');
            eyes.className = 'eyes';
            
            const leftEye = document.createElement('div');
            leftEye.className = 'eye';
            const rightEye = document.createElement('div');
            rightEye.className = 'eye';
            
            eyes.appendChild(leftEye);
            eyes.appendChild(rightEye);
            
            const mouth = document.createElement('div');
            mouth.className = 'mouth';
            
            element.appendChild(eyes);
            element.appendChild(mouth);
        }
        
        // 몬스터에 눈, 입, 볼터치 추가
        if (enemy.type === 'monster') {
            const eyes = document.createElement('div');
            eyes.className = 'monster-eyes';
            
            const leftEye = document.createElement('div');
            leftEye.className = 'monster-eye';
            const rightEye = document.createElement('div');
            rightEye.className = 'monster-eye';
            
            eyes.appendChild(leftEye);
            eyes.appendChild(rightEye);
            
            const mouth = document.createElement('div');
            mouth.className = 'monster-mouth';
            
            const leftCheek = document.createElement('div');
            leftCheek.className = 'monster-cheeks left';
            const rightCheek = document.createElement('div');
            rightCheek.className = 'monster-cheeks right';
            
            element.appendChild(eyes);
            element.appendChild(mouth);
            element.appendChild(leftCheek);
            element.appendChild(rightCheek);
        }
        
        gameArea.appendChild(element);
    }
    
    updateEnemies() {
        this.enemies.forEach(enemy => {
            // AI: 플레이어를 향해 이동
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 0) {
                enemy.x += (dx / distance) * enemy.speed;
                enemy.y += (dy / distance) * enemy.speed;
            }
            
            // 위치 업데이트
            const element = document.getElementById(`enemy-${enemy.id}`);
            if (element) {
                if (enemy.type === 'spirit') {
                    element.style.left = enemy.x - 20 + 'px';
                    element.style.top = enemy.y - 25 + 'px';
                } else {
                    element.style.left = enemy.x - 25 + 'px';
                    element.style.top = enemy.y - 25 + 'px';
                }
            }
        });
    }
    
    updateEffects() {
        this.effects = this.effects.filter(effect => {
            effect.life -= 16;
            if (effect.life <= 0) {
                const element = document.getElementById(`effect-${effect.id}`);
                if (element) element.remove();
                return false;
            }
            return true;
        });
    }
    
    checkCollisions() {
        this.enemies.forEach(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 30) {
                this.player.hp -= enemy.damage;
                this.createDamageText(this.player.x, this.player.y, enemy.damage, '#ff4757');
                
                // 적 제거
                this.removeEnemy(enemy);
            }
        });
    }
    
    useAbility() {
        if (!this.selectedMember) return;
        
        const now = Date.now();
        if (now - this.lastAbilityUse < this.selectedMember.cooldown) return;
        if (this.player.mp < this.selectedMember.mpCost) return;
        
        this.player.mp -= this.selectedMember.mpCost;
        this.lastAbilityUse = now;
        
        // 능력 사용 이펙트
        this.createAbilityEffect();
        
        // 범위 내 적들에게 피해
        this.enemies.forEach(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= this.selectedMember.range) {
                enemy.hp -= this.selectedMember.damage;
                this.createDamageText(enemy.x, enemy.y, this.selectedMember.damage, '#ffd700');
                
                if (enemy.hp <= 0) {
                    this.player.score += enemy.points;
                    this.removeEnemy(enemy);
                }
            }
        });
    }
    
    basicAttack() {
        // 가장 가까운 적 공격
        let closestEnemy = null;
        let closestDistance = Infinity;
        
        this.enemies.forEach(enemy => {
            const dx = this.player.x - enemy.x;
            const dy = this.player.y - enemy.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < closestDistance && distance <= 80) {
                closestDistance = distance;
                closestEnemy = enemy;
            }
        });
        
        if (closestEnemy) {
            closestEnemy.hp -= 10;
            this.createDamageText(closestEnemy.x, closestEnemy.y, 10, '#00d2d3');
            
            if (closestEnemy.hp <= 0) {
                this.player.score += closestEnemy.points;
                this.removeEnemy(closestEnemy);
            }
        }
    }
    
    createAbilityEffect() {
        const gameArea = document.getElementById('gameArea');
        const effect = document.createElement('div');
        effect.className = 'explosion';
        effect.style.left = this.player.x - 30 + 'px';
        effect.style.top = this.player.y - 30 + 'px';
        gameArea.appendChild(effect);
        
        setTimeout(() => effect.remove(), 500);
    }
    
    createDamageText(x, y, damage, color) {
        const gameArea = document.getElementById('gameArea');
        const text = document.createElement('div');
        text.className = 'damage-text';
        text.textContent = `-${damage}`;
        text.style.left = x + 'px';
        text.style.top = y + 'px';
        text.style.color = color;
        gameArea.appendChild(text);
        
        setTimeout(() => text.remove(), 1000);
    }
    
    removeEnemy(enemy) {
        const element = document.getElementById(`enemy-${enemy.id}`);
        if (element) element.remove();
        
        const index = this.enemies.indexOf(enemy);
        if (index > -1) {
            this.enemies.splice(index, 1);
        }
    }
    
    regenerateMP() {
        if (this.player.mp < this.player.maxMp) {
            this.player.mp += 0.1;
            if (this.player.mp > this.player.maxMp) {
                this.player.mp = this.player.maxMp;
            }
        }
    }
    
    updateUI() {
        // HP 바
        const hpPercent = (this.player.hp / this.player.maxHp) * 100;
        document.getElementById('hpFill').style.width = hpPercent + '%';
        document.getElementById('hpText').textContent = `${Math.max(0, Math.floor(this.player.hp))}/${this.player.maxHp}`;
        
        // MP 바
        const mpPercent = (this.player.mp / this.player.maxMp) * 100;
        document.getElementById('mpFill').style.width = mpPercent + '%';
        document.getElementById('mpText').textContent = `${Math.floor(this.player.mp)}/${this.player.maxMp}`;
        
        // 점수
        document.getElementById('score').textContent = this.player.score;
        
        // 아바타
        if (this.selectedMember) {
            document.getElementById('playerAvatar').textContent = this.selectedMember.emoji;
            document.getElementById('abilityName').textContent = this.selectedMember.ability;
            
            // 플레이어 캐릭터에도 이모지 표시
            const playerElement = document.getElementById('player');
            if (playerElement) {
                playerElement.textContent = this.selectedMember.emoji;
            }
        }
        
        // 능력 쿨다운
        const now = Date.now();
        const cooldownRemaining = Math.max(0, this.selectedMember.cooldown - (now - this.lastAbilityUse));
        const abilityBtn = document.getElementById('abilityBtn');
        const cooldownDisplay = document.getElementById('abilityCooldown');
        
        if (cooldownRemaining > 0) {
            abilityBtn.classList.add('cooldown');
            cooldownDisplay.textContent = Math.ceil(cooldownRemaining / 1000);
            cooldownDisplay.style.display = 'flex';
        } else {
            abilityBtn.classList.remove('cooldown');
            cooldownDisplay.style.display = 'none';
        }
        
        // 플레이어 위치 업데이트
        this.updatePlayerPosition();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        clearInterval(this.gameLoop);
        
        document.getElementById('finalScore').textContent = `점수: ${this.player.score}`;
        document.getElementById('survivedTime').textContent = `생존 시간: ${Math.floor(this.gameTime / 1000)}초`;
        
        this.showScreen('gameOverScreen');
    }
}

// 게임 시작
document.addEventListener('DOMContentLoaded', () => {
    new EvilSpiritGame();
});
