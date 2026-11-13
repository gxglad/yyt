(function () {
  var box = document.getElementById('askbox');
  var log = document.getElementById('askLog');
  var form = document.getElementById('askForm');
  var input = document.getElementById('askInput');
  var openBtn = document.getElementById('askOpen');
  var chips = document.getElementById('askChips');
  if (!box || !log) return;

  var FALLBACK = '这个我不太清楚，怕说错。你可以换个问法，或者去学校官网 zjgzzx.zjgedu.cn 查，也可以直接问招生办。';

  var KNOW = [
    {
      k: ['食堂', '吃饭', '餐厅', '饭菜', '伙食', '早餐', '午饭', '晚饭', '吃'],
      a: '<b>学校有 5 个食堂</b>：实训区 2 个、教学区 3 个。菜系比较杂，苏式面、盖浇饭、小炒、面点都有；每学期收一次学生建议，卖得动的留下来，也会定期推新品。'
    },
    {
      k: ['系部', '几个系', '院系', '哪个系', '专业系'],
      a: '五个系部：<b>机械与汽车工程系、智能控制系、信息工程系、经济贸易系、能源材料系</b>。每个系带哪些专业，网页里「五个系部」那一段点开就能看。'
    },
    {
      k: ['停车', '车位', '开车', '自驾', '汽车停', '停车场'],
      a: '有的。<b>学校有单独的停车位</b>，校门外平安路一带也可以临时停放。开放日人比较多，进校按现场指引停。'
    },
    {
      k: ['地址', '在哪', '哪里', '位置', '怎么走', '福新路'],
      a: '江苏省张家港市<b>福新路 2 号</b>，2024 年 7 月整体搬过来的新校区。导航直接搜「江苏省张家港中等专业学校」比较稳。'
    },
    {
      k: ['多大', '面积', '占地', '平方', '亩', '建筑'],
      a: '占地 <b>360 亩</b>，建筑面积 <b>21 万平方米</b>。长卷那一段铺的就是这 360 亩。'
    },
    {
      k: ['专业', '几个专业', '什么专业', '开设'],
      a: '中高职专业一共 <b>28 个</b>，覆盖机电、机械、计算机、会计、新能源汽车、化工、商贸、服装这些方向；省品牌专业 4 个、省示范专业 5 个、省现代化专业群 3 个。'
    },
    {
      k: ['学生', '多少学生', '多少人', '老师', '教师', '师资', '班级'],
      a: '在校班级 <b>147 个</b>、学生 <b>6200 余人</b>；专任教师 <b>419 名</b>，其中全国职教名校长 1 人、省领军人才 4 人、省名师工作室 2 个。'
    },
    {
      k: ['历史', '多久', '几年', '建校', '什么时候建', '沿革', '老校'],
      a: '1980 年办班、1984 年建校。1996 年首批国家级重点职业高中，2009 年首批省四星级，2015 年升格为江苏联合职业技术学院张家港分院，2024 年搬进新校区——四十多年了。'
    },
    {
      k: ['实训', '基地', '设备', '车间', '机房'],
      a: '校内实践基地 <b>10 个</b>。数控技术应用是国家级基地；机电一体化技术、软件与信息服务、加工制造技术是省现代化实训基地；汽车运用与维修、电工技能、财贸、光机电是省级。'
    },
    {
      k: ['奖', '金牌', '技能大赛', '比赛', '荣誉', '成绩'],
      a: '全国技能大赛拿了 <b>78 金 26 银 5 铜</b>；连续二十三届拿张家港市技能竞赛金杯，连续 10 年是省技能大赛先进学校。'
    },
    {
      k: ['招生', '报名', '志愿', '怎么报', '录取', '分数线', '中考'],
      a: '走张家港市中招志愿填报，按对应的办学层次和专业选。今年的批次和时间还没定，以学校当年公告为准——网页里招生那一段写的就是「待定」。'
    },
    {
      k: ['开放日', '参观', '能进', '预约', '看校'],
      a: '开放日的场次、流程和集合地点都还没定，定了会在学校公告里发。等不及的话可以先把网页从头翻一遍，七站都在线上。'
    },
    {
      k: ['学费', '收费', '多少钱', '费用', '住宿费'],
      a: '收费标准我这儿没有准确数字，不敢乱说。建议看当年的招生简章，或者直接问招生办。'
    },
    {
      k: ['宿舍', '住宿', '寝室', '住校'],
      a: '宿舍的具体安排我这儿没有，报到时会一并说明。想提前确认，直接问学校更准。'
    },
    {
      k: ['就业', '工作', '分配', '实习', '企业'],
      a: '对口就业率 <b>90% 以上</b>，用人单位满意度 <b>95% 以上</b>；中级工获证率 99% 以上、高级工 93% 以上。牵头组建的江苏扬子江职业教育集团有 45 家骨干企业。'
    },
    {
      k: ['层次', '几年制', '学制', '大专', '五年', '三加三', '3+3'],
      a: '现在招的是三类：<b>五年一贯制、职教高考、三年制中专</b>。'
    },
    {
      k: ['理念', '校训', '目标', '办学'],
      a: '办学理念是「培养实用技术人才，服务港城经济建设」；办学目标是「牌子叫得响、专业过得硬、办学有特色、学生受欢迎」。'
    },
    {
      k: ['合作', '出国', '国外', '留学', '德国', '日本'],
      a: '和澳大利亚、印度、韩国、日本、德国都有合作：2004 年澳大利亚西南悉尼 TAFE、2006 年印度 NIIT、2011 年韩国湖南大学、2013 年日本不二越与德国 BBW、2019 年德国爱科特。'
    },
    {
      k: ['联系', '电话', '邮箱', '咨询', '公众号', '微信'],
      a: '校长信箱 <b>zjgzdzyxx@163.com</b>，地址福新路 2 号。招生咨询建议看学校公众号发的简章，网页招生那一段也有二维码。'
    },
    {
      k: ['公交', '地铁', '怎么去', '交通', '打车'],
      a: '具体公交线路我这儿没有，怕给错。导航搜「江苏省张家港中等专业学校」，到福新路 2 号就行。'
    },
    {
      k: ['五心', '毕业设计', '谁做的', '这个网站', '这个网页'],
      a: '这个网页是 2022 级毕业设计作品，主题是「五心」苏式工匠——红心、仁心、恒心、匠心、创心。五颗心没有单独列一段，而是落在七站的每一条后面。'
    }
  ];

  var QUICK = ['学校有几个食堂？', '有哪些系部？', '有停车的地方吗？', '开了多少专业？', '什么时候开放日？'];

  function el(tag, cls, html) {
    var d = document.createElement(tag);
    if (cls) d.className = cls;
    if (html) d.innerHTML = html;
    return d;
  }

  function push(who, html) {
    var m = el('div', 'msg' + (who === 'me' ? ' msg--me' : ''));
    m.appendChild(el('span', 'msg__av', who === 'me' ? '我' : '问'));
    var b = el('div', 'msg__b', html);
    m.appendChild(b);
    log.appendChild(m);
    log.scrollTop = log.scrollHeight;
    return b;
  }

  function answer(q) {
    var best = null, bestScore = 0;
    for (var i = 0; i < KNOW.length; i++) {
      var hit = 0;
      for (var j = 0; j < KNOW[i].k.length; j++) {
        if (q.indexOf(KNOW[i].k[j]) > -1) hit += KNOW[i].k[j].length;
      }
      if (hit > bestScore) { bestScore = hit; best = KNOW[i]; }
    }
    return best ? best.a : FALLBACK;
  }

  function ask(text) {
    var q = String(text || '').trim();
    if (!q) return;
    push('me', q.replace(/[<>]/g, ''));
    var b = push('bot', '<span class="msg__dots"><i></i><i></i><i></i></span>');
    setTimeout(function () { b.innerHTML = answer(q); log.scrollTop = log.scrollHeight; }, 520);
  }

  var greeted = false;
  function greet() {
    if (greeted) return;
    greeted = true;
    push('bot', '你好，我是「问校园」。食堂、系部、停车、招生、实训这些常问的，我都能答；答不上来的我会直说。');
  }

  QUICK.forEach(function (t) {
    var c = el('button', 'chip', t);
    c.type = 'button';
    c.addEventListener('click', function () { ask(t); });
    chips.appendChild(c);
  });

  function open() {
    box.classList.add('is-open');
    box.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    document.body.classList.add('is-asking');
    requestAnimationFrame(function () { box.classList.add('is-in'); });
    setTimeout(function () { greet(); input.focus(); }, 220);
  }

  function close() {
    box.classList.remove('is-in');
    box.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.body.classList.remove('is-asking');
    setTimeout(function () { box.classList.remove('is-open'); }, 420);
    if (openBtn) openBtn.focus();
  }

  var clearBtn = document.getElementById('askClear');
  if (clearBtn) {
    clearBtn.addEventListener('click', function () {
      log.innerHTML = '';
      greeted = false;
      greet();
      input.focus();
    });
  }

  if (openBtn) openBtn.addEventListener('click', open);
  Array.prototype.forEach.call(box.querySelectorAll('[data-ask-close]'), function (b) {
    b.addEventListener('click', close);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && box.classList.contains('is-in')) close();
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    ask(input.value);
    input.value = '';
  });
})();
