'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import {
  CalendarDays,
  ChevronDown,
  MapPin,
  Navigation,
  Phone,
  Volume2,
  VolumeX,
} from 'lucide-react';

import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const ASSET = '/assets/';
const MAP_URL =
  'https://www.google.com/maps/search/?api=1&query=Metropole+Wedding+Convention+Center+261+Ly+Chinh+Thang+Ho+Chi+Minh';
const MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1385.721596108673!2d106.68160438756905!3d10.779681207642323!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f2f53a8f12b%3A0x2166a074ded68eee!2zVHJ1bmcgdMOibSBI4buZaSBuZ2jhu4sgJiBUaeG7h2MgY8aw4bubaSBNZXRyb3BvbGU!5e0!3m2!1svi!2s!4v1788588214209!5m2!1svi!2s';

const GALLERY_FLOWERS = [
  ['wild', -5, 22, -6], ['red', 0, 15, -12], ['lavender', 5, 16, -10],
  ['wild', 11, 20, -4], ['pink-lily', 18, 14, -19], ['sweetpea', 27, 12, -22],
  ['bluebells', 35, 10, -24], ['blue', 41, 9, -23], ['lily', 48, 9, -23],
  ['yellow', 54, 9, -24], ['lavender', 60, 10, -24], ['magenta', 66, 11, -23],
  ['blue', 73, 12, -21], ['red', 79, 13, -18], ['sweetpea', 84, 14, -18],
  ['lily', 90, 17, -15], ['wild', 94, 20, -8],
] as const;

type Countdown = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getCountdown(): Countdown {
  const weddingTime = new Date('2026-09-20T08:00:00+07:00').getTime();
  const distance = Math.max(0, weddingTime - Date.now());

  return {
    days: Math.floor(distance / 86_400_000),
    hours: Math.floor((distance / 3_600_000) % 24),
    minutes: Math.floor((distance / 60_000) % 60),
    seconds: Math.floor((distance / 1_000) % 60),
  };
}

function LaceDivider() {
  return (
    <div className="lace-divider" aria-hidden="true">
      <img src={`${ASSET}lace-divider.webp`} alt="" loading="lazy" />
    </div>
  );
}

function WeddingCountdown() {
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  useEffect(() => {
    const update = () => setCountdown(getCountdown());
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div className="countdown" aria-label="Đếm ngược đến ngày cưới" data-reveal>
      {[
        ['Ngày', countdown?.days],
        ['Giờ', countdown?.hours],
        ['Phút', countdown?.minutes],
        ['Giây', countdown?.seconds],
      ].map(([label, value], index) => (
        <div key={label} style={{ '--reveal-delay': `${index * 70}ms` } as CSSProperties}>
          <strong>{value === undefined ? '--' : String(value).padStart(2, '0')}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const musicChoice = useRef(false);
  const [musicPlaying, setMusicPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = .5;
    const startMusic = (event: Event) => {
      if (musicChoice.current || (event.target instanceof Element && event.target.closest('.music-toggle'))) return;
      audio.play().then(removeListeners).catch(() => {});
    };
    const removeListeners = () => {
      window.removeEventListener('pointerup', startMusic);
      window.removeEventListener('keydown', startMusic);
    };
    const playWhenReady = () => {
      if (musicChoice.current || !audio.paused) return;
      audio.volume = .5;
      audio.play().then(removeListeners).catch(() => {});
    };
    window.addEventListener('pointerup', startMusic);
    window.addEventListener('keydown', startMusic);
    audio.addEventListener('canplay', playWhenReady);
    playWhenReady();
    return () => {
      removeListeners();
      audio.removeEventListener('canplay', playWhenReady);
      audio.pause();
    };
  }, []);

  const toggleMusic = () => {
    const audio = audioRef.current;
    if (!audio) return;
    musicChoice.current = true;
    if (audio.paused) {
      audio.volume = .5;
      audio.play().catch(() => setMusicPlaying(false));
    } else {
      audio.pause();
    }
  };

  useEffect(() => {
    document.body.classList.add('reveal-ready');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -5% 0px' },
    );

    document.querySelectorAll('[data-reveal]').forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      document.body.classList.remove('reveal-ready');
    };
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const flowers = Array.from(document.querySelectorAll<HTMLImageElement>('[data-flower-grow]'));
    const pending = new Set(flowers.filter((flower) => !flower.classList.contains('has-grown')));
    let frame = 0;
    // clip-path affects observer intersections, but not the image's layout bounds.
    const revealFlowers = () => {
      frame = 0;
      const viewportBottom = window.innerHeight * .98;
      pending.forEach((flower) => {
        const bounds = flower.getBoundingClientRect();
        if (bounds.width > 0 && bounds.height > 0 && bounds.top < viewportBottom && bounds.bottom > 0 && bounds.right > 0 && bounds.left < window.innerWidth) {
          flower.classList.add('has-grown');
          pending.delete(flower);
        }
      });
    };
    const scheduleReveal = () => {
      if (!frame && pending.size) frame = window.requestAnimationFrame(revealFlowers);
    };
    document.body.classList.add('flowers-ready');
    window.addEventListener('scroll', scheduleReveal, { passive: true });
    window.addEventListener('resize', scheduleReveal);
    flowers.forEach((flower) => flower.addEventListener('load', scheduleReveal));
    scheduleReveal();
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleReveal);
      window.removeEventListener('resize', scheduleReveal);
      flowers.forEach((flower) => flower.removeEventListener('load', scheduleReveal));
      document.body.classList.remove('flowers-ready');
    };
  }, []);

  return (
    <>
      <audio ref={audioRef} src="/audio/cinnamon-girl.mp3" autoPlay loop preload="auto" onPlay={() => setMusicPlaying(true)} onPause={() => setMusicPlaying(false)} />
      <button type="button" className="music-toggle" onClick={toggleMusic} aria-label={musicPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'} aria-pressed={musicPlaying} title={musicPlaying ? 'Tắt nhạc nền' : 'Bật nhạc nền'}>
        {musicPlaying ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
      </button>
      <header className="top-nav" aria-label="Điều hướng chính">
        <nav>
          <a href="#ceremony">Hôn lễ</a>
          <a href="#reception">Tiệc cưới</a>
          <a href="#directions">Chỉ đường</a>
          <a href="#gallery">Khoảnh khắc</a>
        </nav>
        <a
          className={cn(buttonVariants({ variant: 'outline', size: 'lg' }), 'top-nav__cta')}
          href={MAP_URL}
          target="_blank"
          rel="noreferrer"
        >
          <Navigation aria-hidden="true" />
          Mở bản đồ
        </a>
      </header>

      <main className="site-shell">
        <section className="hero" id="top" aria-labelledby="hero-title">
          <div className="hero__backdrop" aria-hidden="true" />
          <div className="hero__glow" aria-hidden="true" />

          <img className="hero__columns" src={`${ASSET}hero-columns.webp`} alt="" aria-hidden="true" fetchPriority="high" />

          <div className="hero__canopy" aria-hidden="true">
            <img className="canopy-flower canopy-flower--corner-left" src={`${ASSET}floral-corner-left.webp`} alt="" />
            <img className="canopy-flower canopy-flower--far-left" src={`${ASSET}floral-sweetpea.webp`} alt="" />
            <img className="canopy-flower canopy-flower--left" src={`${ASSET}floral-wisteria.webp`} alt="" />
            <img className="canopy-flower canopy-flower--middle-left" src={`${ASSET}floral-wisteria.webp`} alt="" />
            <img className="canopy-flower canopy-flower--middle-right" src={`${ASSET}floral-wisteria.webp`} alt="" />
            <img className="canopy-flower canopy-flower--right" src={`${ASSET}floral-wisteria.webp`} alt="" />
            <img className="canopy-flower canopy-flower--magenta" src={`${ASSET}floral-magenta.webp`} alt="" />
            <img className="canopy-flower canopy-flower--bird" src={`${ASSET}floral-hummingbird.webp`} alt="" />
          </div>

          <div className="hero__content">
            <div className="hero__monogram" aria-hidden="true">
              <img src={`${ASSET}hero-monogram.webp`} alt="" />
            </div>

            <p className="hero__eyebrow">
              <span>The wedding</span>
              <i>of</i>
            </p>
            <h1 className="hero__names" id="hero-title">
              <span>Quang Huy</span>
              <i className="love-ampersand">&amp;</i>
              <span>Hạnh Thảo</span>
            </h1>
            <time className="hero__date" dateTime="2026-09-20">20 · 09 · 2026</time>
          </div>

          <div className="hero__garden" aria-hidden="true">
            <img className="garden-flower garden-flower--wild" src={`${ASSET}floral-wild.webp`} alt="" />
            <img className="garden-flower garden-flower--red" src={`${ASSET}floral-red.webp`} alt="" />
            <img className="garden-flower garden-flower--lavender" src={`${ASSET}floral-lavender.webp`} alt="" />
            <img className="garden-flower garden-flower--blue" src={`${ASSET}floral-blue.webp`} alt="" />
            <img className="garden-flower garden-flower--bluebells" src={`${ASSET}floral-bluebells.webp`} alt="" />
            <img className="garden-flower garden-flower--yellow" src={`${ASSET}floral-yellow.webp`} alt="" />
            <img className="garden-flower garden-flower--lily" src={`${ASSET}floral-lily.webp`} alt="" />
            <img className="garden-flower garden-flower--sweetpea" src={`${ASSET}floral-sweetpea.webp`} alt="" />
            <img className="garden-flower garden-flower--pink" src={`${ASSET}floral-pink-lily.webp`} alt="" />
            <img className="garden-flower garden-flower--magenta" src={`${ASSET}floral-magenta.webp`} alt="" />
            <img className="garden-flower garden-flower--wild-right" src={`${ASSET}floral-wild.webp`} alt="" />
            <img className="garden-flower garden-flower--red-extra" src={`${ASSET}floral-red.webp`} alt="" />
            <img className="garden-flower garden-flower--lavender-extra" src={`${ASSET}floral-lavender.webp`} alt="" />
            <img className="garden-flower garden-flower--blue-extra" src={`${ASSET}floral-blue.webp`} alt="" />
            <img className="garden-flower garden-flower--lily-extra" src={`${ASSET}floral-lily.webp`} alt="" />
            <img className="garden-flower garden-flower--duplicate garden-flower--d1" src={`${ASSET}floral-wild.webp`} alt="" />
            <img className="garden-flower garden-flower--duplicate garden-flower--d2" src={`${ASSET}floral-red.webp`} alt="" />
            <img className="garden-flower garden-flower--duplicate garden-flower--d3" src={`${ASSET}floral-lavender.webp`} alt="" />
            <img className="garden-flower garden-flower--duplicate garden-flower--d4" src={`${ASSET}floral-blue.webp`} alt="" />
            <img className="garden-flower garden-flower--duplicate garden-flower--d5" src={`${ASSET}floral-bluebells.webp`} alt="" />
            <img className="garden-flower garden-flower--duplicate garden-flower--d6" src={`${ASSET}floral-yellow.webp`} alt="" />
            <img className="garden-flower garden-flower--duplicate garden-flower--d7" src={`${ASSET}floral-lily.webp`} alt="" />
            <img className="garden-flower garden-flower--duplicate garden-flower--d8" src={`${ASSET}floral-sweetpea.webp`} alt="" />
            <img className="garden-flower garden-flower--duplicate garden-flower--d9" src={`${ASSET}floral-pink-lily.webp`} alt="" />
            <img className="garden-flower garden-flower--duplicate garden-flower--d10" src={`${ASSET}floral-magenta.webp`} alt="" />
            <img className="garden-flower garden-flower--duplicate garden-flower--d11" src={`${ASSET}floral-wild.webp`} alt="" />
            <img className="garden-flower garden-flower--duplicate garden-flower--d12" src={`${ASSET}floral-red.webp`} alt="" />
            <img className="garden-flower garden-flower--duplicate garden-flower--d13" src={`${ASSET}floral-lavender.webp`} alt="" />
            <img className="garden-flower garden-flower--duplicate garden-flower--d14" src={`${ASSET}floral-blue.webp`} alt="" />
            <img className="garden-flower garden-flower--duplicate garden-flower--d15" src={`${ASSET}floral-lily.webp`} alt="" />
          </div>

          <a className="hero__scroll" href="#invitation" aria-label="Xem thiệp cưới">
            <ChevronDown aria-hidden="true" />
          </a>
        </section>

        <LaceDivider />

        <section className="paper-section invitation" id="invitation" aria-labelledby="invitation-title">
          <div className="invitation__sheet">
            <div className="invitation__florals" aria-hidden="true">
              <img className="invitation__flower invitation__flower--top-left" src={`${ASSET}invitation-wisteria.webp`} alt="" loading="lazy" data-flower-grow="down" />
              <img className="invitation__flower invitation__flower--top-right" src={`${ASSET}invitation-wisteria.webp`} alt="" loading="lazy" data-flower-grow="down" />
            </div>
            <div className="invitation__intro" data-reveal>
              <img className="invitation__monogram" src={`${ASSET}invitation-monogram.webp`} alt="" aria-hidden="true" loading="lazy" />
              <h2 id="invitation-title">Hành trình của chúng mình bắt đầu một chương mới,<br />và thật hạnh phúc khi có bạn cùng chứng kiến ♡</h2>
            </div>
            <div className="families-grid">
              <article data-reveal style={{ '--reveal-delay': '80ms' } as CSSProperties}>
                <p className="family-label">Nhà trai</p>
                <h3>Ông: Nguyễn Văn Hoàng</h3>
                <h3>Bà: Trần Thị Hường</h3>
                <address>156/6A, Tân Mỹ, Tân Thuận TP. Hồ Chí Minh</address>
              </article>
              <article data-reveal style={{ '--reveal-delay': '180ms' } as CSSProperties}>
                <p className="family-label">Nhà gái</p>
                <h3>Ông: Nguyễn Vũ Đình Tuyên</h3>
                <h3>Bà: Nguyễn Thị Linh Hạnh</h3>
                <address>38A, Nguyễn Thiện Thuật, Đức Trọng, Lâm Đồng</address>
              </article>
            </div>
            <div className="ceremony-card" id="ceremony">
              <h2 className="ceremony-title" data-reveal>Lễ Thành Hôn</h2>
              <div className="ceremony-names">
                <div data-reveal><small>Quý nam</small><span>Nguyễn Quang Huy</span></div>
                <i className="love-ampersand">&amp;</i>
                <div data-reveal><small>Quý nữ</small><span>Nguyễn Linh Hạnh Thảo</span></div>
              </div>
              <div className="ceremony-details" data-reveal>
                <p>Hôn lễ được cử hành tại Tư Gia</p>
                <div className="event-date">
                  <span>Chủ Nhật</span>
                  <strong>20 · 09 · 2026</strong>
                  <span>08:00</span>
                </div>
                <small>(Tức ngày 10 tháng 08 năm Bính Ngọ)</small>
              </div>
            </div>
          </div>
          <div className="invitation__base-florals" aria-hidden="true">
            <img className="invitation__flower invitation__flower--bottom-left" src={`${ASSET}invitation-wild.webp`} alt="" loading="lazy" data-flower-grow="up" />
            <img className="invitation__flower invitation__flower--bottom-right" src={`${ASSET}floral-pink-lily.webp`} alt="" loading="lazy" data-flower-grow="up" />
          </div>
          <div className="section-inner invitation__countdown">
            <WeddingCountdown />
          </div>
        </section>

        <LaceDivider />

        <section className="paper-section reception" id="reception" aria-labelledby="reception-title">
          <div className="reception__sheet">
          <img className="reception__ribbon" src={`${ASSET}ribbon.webp`} alt="" aria-hidden="true" loading="lazy" data-reveal />
          <img className="reception__photo reception__photo--left" src={`${ASSET}heart-one.webp`} alt="Quang Huy và Hạnh Thảo trong khung ảnh trái tim" loading="lazy" data-reveal />
          <img className="reception__photo reception__photo--right" src={`${ASSET}heart-two.webp`} alt="Khoảnh khắc cưới của Quang Huy và Hạnh Thảo" loading="lazy" data-reveal />

          <div className="reception__copy" data-reveal>
            <h2 id="reception-title">Trân trọng kính mời</h2>
            <p className="reception__invitation">Bạn đến chung vui cùng chúng mình<br />trong ngày đặc biệt này ♡</p>
            <div className="reception__venue">
              <p>Tiệc cưới được tổ chức tại</p>
              <div className="venue-name">
                <small>Trung tâm Hội nghị &amp; Tiệc cưới</small>
                <strong>Metropole</strong>
                <span>(Sảnh Milan)</span>
              </div>
              <address>261 Lý Chính Thắng, Nhiêu Lộc, TP. Hồ Chí Minh</address>
            </div>
            <div className="reception__time">
              <span>Vào lúc 11 giờ 00 – Chủ Nhật</span>
              <strong>20 · 09 · 2026</strong>
              <small>(Tức ngày 10 tháng 08 năm Bính Ngọ)</small>
            </div>
            <p className="reception__note">Sự hiện diện của bạn<br />sẽ làm ngày vui của chúng mình thêm trọn vẹn ♡</p>
          </div>
          </div>
        </section>

        <LaceDivider />

        <section className="paper-section directions" id="directions" aria-labelledby="directions-title">
          <div className="directions__sheet">
          <div className="directions__inner">
            <div className="directions__left">
              <div className="directions__contact" data-reveal>
                <h2 id="directions-title">Nếu cần một chút trợ giúp trên đường đến ngày vui,<br />Quý khách cứ liên hệ với chúng mình nhé ạ ♡</h2>
                <a href="tel:0377174710" aria-label="Gọi chú rể, 0377 174 710">Chú rể · 0377174710</a>
                <a href="tel:0399294113" aria-label="Gọi cô dâu, 0399 294 113">Cô dâu · 0399294113</a>
              </div>
            <div className="venue-frame" data-reveal>
              <img src={`${ASSET}venue-frame.webp`} alt="" aria-hidden="true" loading="lazy" />
              <div>
                <small>Tiệc cưới được tổ chức tại</small>
                <p>Trung tâm Hội nghị &amp; Tiệc cưới</p>
                <strong>Metropole</strong>
                <span>(Sảnh Milan)</span>
                <address>261 Lý Chính Thắng, Nhiêu Lộc<br />TP. Hồ Chí Minh</address>
              </div>
            </div>
            </div>
            <div className="directions-card" data-reveal style={{ '--reveal-delay': '140ms' } as CSSProperties}>
              <p>Đường đến tiệc cưới<br />ở đây ạaa ♡</p>
              <a href={MAP_URL} target="_blank" rel="noreferrer" aria-label="Mở chỉ đường đến Metropole trong Google Maps">
                <img className="directions-card__qr" src={`${ASSET}qr.png`} alt="Mã QR chỉ đường đến tiệc cưới" loading="lazy" />
              </a>
              <div className="directions-card__map">
                <iframe title="Bản đồ Trung tâm Hội nghị & Tiệc cưới Metropole" src={MAP_EMBED_URL} width="600" height="450" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="strict-origin-when-cross-origin" />
              </div>
              <div className="directions-card__links">
                <a href={MAP_URL} target="_blank" rel="noreferrer">Mở bản đồ</a>
                <a href="/wedding.ics" download>Thêm vào lịch</a>
              </div>
            </div>
          </div>
          <p className="directions__note" data-reveal>Từ những con đường khác nhau,<br />hẹn gặp nhau tại một ngày thật đẹp ♡</p>
          </div>
        </section>

        <LaceDivider />

        <section className="gallery-section" id="gallery" aria-labelledby="gallery-title">
          <div className="gallery-section__sheet">
          <img className="gallery-section__flower gallery-section__flower--left" src={`${ASSET}floral-wisteria.webp`} alt="" aria-hidden="true" loading="lazy" data-flower-grow="down" />
          <img className="gallery-section__flower gallery-section__flower--right" src={`${ASSET}floral-hummingbird.webp`} alt="" aria-hidden="true" loading="lazy" data-flower-grow="down" />
          <div className="section-intro" data-reveal>
            <h2 id="gallery-title">Quang Huy <span className="love-ampersand">&amp;</span> Hạnh Thảo</h2>
            <p>Một chút yêu thương, một chút kỷ niệm, và rất nhiều chúng mình ♡</p>
          </div>

          <div className="filmstrip" aria-label="Dải ảnh cưới của Quang Huy và Hạnh Thảo">
            <div className="filmstrip__track">
              <img src={`${ASSET}filmstrip.webp`} alt="Những khoảnh khắc cưới của Quang Huy và Hạnh Thảo" loading="lazy" />
              <img src={`${ASSET}filmstrip.webp`} alt="" aria-hidden="true" loading="lazy" />
            </div>
          </div>

          <img className="gallery-section__illustration" src={`${ASSET}illustration.webp`} alt="Minh họa cô dâu chú rể cùng những chú mèo" loading="lazy" data-reveal />
          <div className="gallery-section__garden" aria-hidden="true">
            {GALLERY_FLOWERS.map(([flower, left, width, bottom], index) => (
              <img key={`${flower}-${index}`} src={`${ASSET}floral-${flower}.webp`} alt="" loading="lazy" data-flower-grow="up" style={{ left: `${left}%`, width: `${width}%`, bottom: `${bottom}%`, animationDelay: `${index * -.65}s`, '--grow-delay': `${(index % 5) * 65}ms` } as CSSProperties} />
            ))}
          </div>
          </div>
        </section>

        <LaceDivider />

        <section className="closing-section" aria-labelledby="closing-title">
          <div className="closing-section__sheet">
          <img className="closing-section__polaroids" src={`${ASSET}polaroids.webp`} alt="Hai tấm ảnh cưới nối với nhau bằng ruy băng xanh" loading="lazy" data-reveal />
          <div className="closing-section__copy" data-reveal>
            <h2 id="closing-title">Cảm ơn bạn đã dành thời gian<br />để cùng chúng mình đi qua ngày đặc biệt này ♡</h2>
            <strong>Quang Huy <span className="love-ampersand">&amp;</span> Hạnh Thảo</strong>
            <time dateTime="2026-09-20">20 · 09 · 2026</time>
          </div>
          </div>
        </section>
      </main>

      <nav className="mobile-dock" aria-label="Liên kết nhanh">
        <a href={MAP_URL} target="_blank" rel="noreferrer">
          <MapPin aria-hidden="true" />
          <span>Chỉ đường</span>
        </a>
        <a href="/wedding.ics" download>
          <CalendarDays aria-hidden="true" />
          <span>Thêm lịch</span>
        </a>
        <a href="tel:0399294113">
          <Phone aria-hidden="true" />
          <span>Liên hệ</span>
        </a>
      </nav>
    </>
  );
}
