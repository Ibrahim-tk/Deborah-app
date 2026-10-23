/**
 * @pattern DerivedPage — AI-native content surface: 36px serif title (TextReveal), trailing
 *          action beside the title, full-width search under the title when set. Way out above:
 *          Back on its own row, then breadcrumbs under it (when below another page in the section),
 *          else Back alone (section root / Home). No composer — Home and Chat own that.
 * @usedBy  M-7.* · M-9.* · M-10.* · M-11.* (web hubs, settings, readers — not chat/onboarding)
 */
import type { CSSProperties, ReactNode } from 'react';
import { Button, Input, TextReveal } from '@web/ui';
import { meta, useNav, useNavStore, useRoute } from '@web/navigation';
import styles from './DerivedPage.module.css';

export interface DerivedPageProps {
  title: string;
  /** Segmented tabs or other filters under the title. */
  tabs?: ReactNode;
  /** When set with `onQueryChange`, renders a full-width search field under the title. */
  query?: string;
  onQueryChange?: (q: string) => void;
  searchLabel?: string;
  searchPlaceholder?: string;
  children: ReactNode;
  /** Right master–detail pane (wide). When set, body becomes two columns. */
  detail?: ReactNode;
  split?: boolean;
  /** @deprecated Composer removed from DerivedPage; ignored. */
  composerPlaceholder?: string;
  /** Override auto Back (default: show when `canGoBack`). */
  showBack?: boolean;
  /** Override Back action (default: `pop`). Use with DetailHost `clear`. */
  onBack?: () => void;
  /** Optional trailing control beside search (e.g. New note). */
  trailing?: ReactNode;
  /** Content width in px when the screen's body is narrower than the default (keeps title + Back aligned with it). */
  contentWidth?: number;
}

export function DerivedPage({
  title,
  tabs,
  searchLabel = 'Search',
  searchPlaceholder = 'Search',
  query,
  onQueryChange,
  children,
  detail,
  split = false,
  showBack,
  onBack,
  trailing,
  contentWidth,
}: DerivedPageProps) {
  const { pop, popToRoot, switchTab } = useNav();
  const { canGoBack, previousTitle, container, route } = useRoute();
  // Embedded in a list/side pane (DetailHost): the host owns the way out — no Back or breadcrumbs here.
  const embedded = route.key.startsWith('embed-');
  const activeTab = useNavStore((st) => st.activeTab);
  const stack = useNavStore((st) => st.tabs[st.activeTab]);
  const showSearch = typeof onQueryChange === 'function';
  // Every page has a way out: back down the stack, or home when this page is a section root.
  const goHome = () => {
    switchTab('ask');
    popToRoot();
  };
  const backVisible = !embedded && (showBack ?? (canGoBack || container === 'stack'));
  const handleBack = onBack ?? (canGoBack ? pop : goHome);
  const backLabel = canGoBack && previousTitle ? `Back to ${previousTitle}` : canGoBack ? 'Back' : 'Back to Home';
  // Breadcrumbs wherever the page sits below another one in its section (Home › Visit notes › Note,
  // Settings › Notifications …). A section's root page shows Back to Home instead.
  const SECTION: Record<string, string> = { ask: 'Home', health: 'My Health', account: 'Settings' };
  const crumbs =
    !embedded && container === 'stack' && stack.length > 1 && !onBack
      ? stack.map((r, i) => ({ id: r.id, label: i === 0 ? SECTION[activeTab] ?? meta(r.id)?.title ?? '' : meta(r.id)?.title ?? '', depth: i }))
      : undefined;
  const goToCrumb = (depth: number) => {
    for (let n = stack.length - 1; n > depth; n--) pop();
  };

  return (
    <div
      className={styles.root}
      data-split={split || undefined}
      data-embedded={embedded || undefined}
      style={contentWidth ? ({ '--page-w': `${contentWidth}px` } as CSSProperties) : undefined}
    >
      <div className={styles.column}>
        <header className={styles.header}>
          {/* Back on its own row; breadcrumbs sit under it, then the title. */}
          {(crumbs || backVisible) && (
            <div className={styles.chrome}>
              <Button
                variant="ghost"
                size="sm"
                className={styles.back}
                leadingIcon="back"
                onClick={handleBack}
                aria-label={backLabel}
              >
                Back
              </Button>
              {crumbs && (
                <nav className={styles.crumbNav} aria-label="Breadcrumb">
                  <ol className={styles.crumbs}>
                    {crumbs.map((c, i) => (
                      <li key={`${c.id}-${i}`}>
                        {i < crumbs.length - 1 ? (
                          <button type="button" className={styles.crumbLink} onClick={() => goToCrumb(c.depth)}>{c.label}</button>
                        ) : (
                          <span aria-current="page">{c.label}</span>
                        )}
                      </li>
                    ))}
                  </ol>
                </nav>
              )}
            </div>
          )}
          <div className={styles.titleRow}>
            <TextReveal as="h1" className={styles.title} text={title} delay={180} stagger={22} />
            {trailing && <div className={styles.trailing}>{trailing}</div>}
          </div>
          {showSearch && (
            <div className={styles.search}>
              <Input
                variant="search"
                label={searchLabel}
                hideLabel
                placeholder={searchPlaceholder}
                value={query ?? ''}
                onChange={(e) => onQueryChange?.(e.target.value)}
              />
            </div>
          )}
          {tabs && (
            <div key={title} className={styles.rise}>
              <div className={styles.tabs}>{tabs}</div>
            </div>
          )}
        </header>

        <div key={`body-${title}`} className={styles.body}>
          <div className={`${styles.listPane} ${styles.rise}`}>{children}</div>
          {split && (
            <div className={styles.detailPane} aria-live="polite">
              {detail ?? <p className={styles.paneEmpty}>Select an item to read it here.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
