# 🤝 دليل المساهمة

شكراً لاهتمامك بالمساهمة في **Point Market System**! 

يسعدنا استقبال المساهمات من المطورين والمصممين والاختباريين.

---

## 🎯 أنواع المساهمات المرحب بها

### 🐛 تصحيح الأخطاء (Bug Fixes)
```
إذا وجدت خطأ:
1. تحقق أنه لم يتم إبلاغ عنه من قبل
2. صف الخطأ بوضوح
3. أرفق خطوات التكرار
4. أرفق لقطة شاشة إن أمكن
```

### ✨ ميزات جديدة (New Features)
```
قبل البدء في ميزة جديدة:
1. افتح issue لمناقشة الفكرة
2. انتظر الموافقة
3. اعمل على branch منفصل
4. اكتب tests للميزة
```

### 📚 تحسينات التوثيق (Documentation)
```
لتحسين التوثيق:
1. صحح الأخطاء الإملائية
2. أضف أمثلة واضحة
3. حسّن الشرح
4. ترجم إلى لغات أخرى
```

### ⚡ تحسينات الأداء (Performance)
```
لتحسين الأداء:
1. قياس الأداء قبل وبعد
2. التوثيق الكامل للتحسينات
3. اختبار على أجهزة مختلفة
```

### 🎨 تحسينات التصميم (Design)
```
لتحسينات التصميم:
1. أرفق مسودات وصور
2. اشرح التغييرات
3. تأكد من الـ responsive design
4. جرب على أجهزة مختلفة
```

---

## 🚀 خطوات البدء

### 1. Fork المستودع
```bash
# على GitHub
اذهب إلى https://github.com/aurahani77/Point-Market-Agent-
اضغط على Fork
```

### 2. استنساخ المستودع المحلي
```bash
git clone https://github.com/YOUR_USERNAME/Point-Market-Agent-.git
cd Point-Market-Agent-
```

### 3. إضافة upstream remote
```bash
git remote add upstream https://github.com/aurahani77/Point-Market-Agent-.git
```

### 4. إنشاء branch جديد
```bash
# للميزات الجديدة
git checkout -b feature/descriptive-name

# لتصحيح الأخطاء
git checkout -b fix/bug-description

# لتحسينات التوثيق
git checkout -b docs/improvement-name
```

### 5. العمل على التغييرات
```bash
# تأكد من أن الكود يتبع معايير المشروع
# اختبر التغييرات جيداً
# أضف comments وتوثيق
```

### 6. Commit التغييرات
```bash
git add .
git commit -m "نوع: وصف قصير"

# أنواع Commit:
# feat: ميزة جديدة
# fix: تصحيح خطأ
# docs: تغييرات في التوثيق
# style: تنسيق الكود
# refactor: إعادة هيكلة الكود
# perf: تحسينات الأداء
# test: إضافة اختبارات
```

### 7. Push التغييرات
```bash
git push origin feature/descriptive-name
```

### 8. فتح Pull Request
```
على GitHub:
1. اذهب إلى صفحة Fork الخاص بك
2. اضغط على "New Pull Request"
3. اختر المستودع الأساسي والفرع الخاص بك
4. املأ وصف الـ PR
5. اضغط "Create Pull Request"
```

---

## ✅ معايير الكود

### JavaScript
```javascript
// ✅ صحيح
const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + item.price, 0);
};

// ❌ خطأ
function calculateTotal(items){
  var total = 0
  for(let i=0;i<items.length;i++){
    total+=items[i].price
  }
  return total
}

// معايير:
// - استخدم const و let بدلاً من var
// - استخدم arrow functions
// - تعليقات واضحة عند الحاجة
// - أسماء متغيرات واضحة
```

### CSS
```css
/* ✅ صحيح */
.button {
    padding: var(--spacing-3) var(--spacing-4);
    background-color: var(--primary);
    border-radius: var(--radius-md);
    transition: all var(--transition-fast);
}

.button:hover {
    transform: translateY(-2px);
}

/* ❌ خطأ */
.btn {
    padding: 8px 16px;
    bg: #2563eb;
    border-radius: 6px;
}

/* معايير:
   - استخدم CSS variables
   - اتبع الـ BEM naming
   - استخدم classes بدلاً من IDs
   - تجنب inline styles
*/
```

### HTML
```html
<!-- ✅ صحيح -->
<div class="card">
    <h2>العنوان</h2>
    <p>الوصف</p>
    <button class="btn btn-primary">إجراء</button>
</div>

<!-- ❌ خطأ -->
<div>
    <h2 style="color: blue;">العنوان</h2>
    <p>الوصف</p>
    <button onclick="doSomething()">إجراء</button>
</div>

<!-- معايير:
     - استخدم semantic HTML
     - تجنب inline styles
     - استخدم event listeners بدلاً من onclick
     - هيكل منظم وواضح
-->
```

---

## 🧪 الاختبار

### الاختبار اليدوي
```
1. فتح التطبيق
2. اختبر جميع الحالات:
   - Desktop (1920x1080)
   - Tablet (768x1024)
   - Mobile (375x667)
   - Dark Mode و Light Mode

3. اختبر الميزات:
   - تسجيل الدخول
   - إضافة منتج
   - تحديث مخزون
   - إنشاء فاتورة

4. تحقق من:
   - عدم وجود أخطاء في Console
   - الأداء جيد
   - البيانات محفوظة صحيح
```

### الاختبار على المتصفحات
```
اختبر على:
- Chrome (الأحدث)
- Firefox (الأحدث)
- Safari (إن أمكن)
- Edge (الأحدث)
```

---

## 📋 قائمة التحقق قبل الـ PR

قبل فتح Pull Request، تأكد من:

- [ ] الكود يتبع معايير المشروع
- [ ] لا توجد أخطاء في Console
- [ ] اختبرت على Desktop و Mobile
- [ ] اختبرت Dark Mode و Light Mode
- [ ] البيانات محفوظة بشكل صحيح
- [ ] الـ Responsive Design يعمل
- [ ] أضفت تعليقات عند الحاجة
- [ ] updated التوثيق إن لزم
- [ ] لا توجد ملفات غير ضرورية
- [ ] البيانات الحساسة محمية

---

## 💬 أسلوب الاتصال

### نصائح للتواصل الفعال
```
✅ افعل:
  - كن لطيفاً واحترافياً
  - اشرح أفكارك بوضوح
  - اقبل الملاحظات البناءة
  - ركز على الأفكار لا الأشخاص

❌ لا تفعل:
  - تجاهل الملاحظات
  - كن حاداً أو وقحاً
  - تتجاهل معايير الكود
  - تعمل بدون توثيق
```

---

## 🎓 نصائح للمساهمين الجدد

### 1. ابدأ بـ Issues السهلة
```
ابحث عن issues مع tags:
- good first issue
- beginner friendly
- help wanted
```

### 2. اقرأ التوثيق أولاً
```
قراءة مهمة:
- README.md
- CONTRIBUTING.md (هذا الملف)
- PHASE1_SUMMARY.md
```

### 3. اسأل إذا لم تفهم شيء
```
لا تتردد في:
- فتح Discussion
- تعليق على Issue
- طلب توضيح في PR
```

### 4. ابدأ صغيراً
```
أفكار للمبتدئين:
- تحسين التوثيق
- إضافة تعليقات
- تحسينات صغيرة
- اختبار الميزات
```

---

## 🔄 عملية المراجعة (Code Review)

### كيف يتم المراجعة
```
1. فتح PR
2. مراجعة تلقائية (Linting)
3. مراجعة يدوية من المشرفين
4. التعليقات والاقتراحات
5. إجراء التحسينات
6. الموافقة النهائية
7. دمج الـ PR
```

### الرد على التعليقات
```
✅ افعل:
  - شكر على الملاحظات
  - اشرح تفكيرك
  - قدم حلولاً بديلة
  - ركز على التحسن

❌ لا تفعل:
  - تهاجم المراجع
  - تقاوم الملاحظات
  - لا تستجب
  - تتعامل بعدوانية
```

---

## 📞 الاتصال

### أين تجد المساعدة
```
📧 البريد: contact@pointmarket.dev
💬 Discord: https://discord.gg/pointmarket
🐦 Twitter: @PointMarketApp
```

### أوقات الدعم
```
الدعم متاح:
  🌍 UTC: 9 AM - 5 PM (الاثنين - الجمعة)
  🌏 KSA: 12 PM - 8 PM (الاثنين - الجمعة)
```

---

## 📊 معايير الجودة

### Coverage المطلوب
- JavaScript: 80%+ coverage
- CSS: معايير المشروع
- HTML: Semantic HTML

### Performance
- Page Load: < 3 seconds
- First Paint: < 1 second
- Bundle Size: < 500KB

### Accessibility
- WCAG 2.1 Level AA
- Keyboard Navigation
- Screen Reader Support

---

## 🎁 الحوافز

### نظام النقاط
```
✅ تصحيح خطأ بسيط: 5 نقاط
✅ ميزة صغيرة: 10 نقاط
✅ ميزة متوسطة: 25 نقاط
✅ ميزة كبيرة: 50+ نقاط
✅ تحسين توثيق: 3 نقاط
```

### المكافآت
```
🏆 100 نقطة: رتبة "المساهم"
🏆 250 نقطة: رتبة "المطور"
🏆 500 نقطة: رتبة "الرائد"
🏆 1000 نقطة: رتبة "المؤسس"
```

---

## 📝 الترخيص

بمساهمتك، أنت توافق على ترخيص الكود تحت [MIT License](LICENSE)

---

## 🙏 شكراً!

شكراً على مساهمتك في تحسين Point Market System!

كل مساهمة صغيرة أو كبيرة مهمة جداً لنا. 🚀

---

**آخر تحديث**: 24 يوليو 2026  
_نتطلع لرؤية مساهمتك!_ ✨
