import clsx from 'clsx'

const FlaticonIcon = ({ name, family = 'rr', className }) => (
  <i
    className={clsx(
      'fi inline-flex leading-none',
      `fi-${family}-${name}`,
      className
    )}
    aria-hidden="true"
  />
)

export const IconDashboard = () => <FlaticonIcon name="dashboard-panel" />
export const IconProfile = () => <FlaticonIcon name="user" />
export const IconUsers = () => <FlaticonIcon name="users-alt" />
export const IconSettings = () => <FlaticonIcon name="settings" />
export const IconRefresh = () => <FlaticonIcon name="refresh" />
export const IconMenu = () => <FlaticonIcon name="menu-burger" />
export const IconChevronLeft = () => <FlaticonIcon name="angle-small-left" />
export const IconChevronDown = () => <FlaticonIcon name="angle-small-down" />
export const IconKeyboard = () => <FlaticonIcon name="keyboard" />
export const IconBell = () => <FlaticonIcon name="bell" />
export const IconMoon = () => <FlaticonIcon name="moon" />
export const IconWalk = () => <FlaticonIcon name="walking" />
export const IconScale = () => <FlaticonIcon name="scale" />
export const IconActivity = () => <FlaticonIcon name="pulse" />
export const IconTarget = () => <FlaticonIcon name="target" />
export const IconZap = () => <FlaticonIcon name="bolt" family="sr" />
export const IconShield = () => <FlaticonIcon name="shield-check" />
export const IconLogOut = () => <FlaticonIcon name="sign-out-alt" />
export const IconEdit = () => <FlaticonIcon name="edit" />
export const IconMonitor = () => <FlaticonIcon name="computer" />
export const IconAlertTriangle = () => <FlaticonIcon name="triangle-warning" />
export const IconClipboard = () => <FlaticonIcon name="clipboard-list" />
export const IconTrendingUp = () => <FlaticonIcon name="chart-line-up" />
export const IconAward = () => <FlaticonIcon name="trophy" />
export const IconHeart = () => <FlaticonIcon name="heart" />
export const IconMessageCircle = () => <FlaticonIcon name="comment-alt" />
export const IconMail = () => <FlaticonIcon name="envelope" />
export const IconLock = () => <FlaticonIcon name="lock" />
export const IconEye = () => <FlaticonIcon name="eye" />
export const IconEyeOff = () => <FlaticonIcon name="eye-crossed" />
export const IconArrowLeft = () => <FlaticonIcon name="arrow-small-left" />
export const IconArrowRight = () => <FlaticonIcon name="arrow-small-right" />
export const IconUserPlus = () => <FlaticonIcon name="user-add" />
export const IconAtSign = () => <FlaticonIcon name="at" />
export const IconKey = () => <FlaticonIcon name="key" />
export const IconBriefcase = () => <FlaticonIcon name="briefcase" />
export const IconCheck = () => <FlaticonIcon name="check" />
export const IconX = () => <FlaticonIcon name="cross-small" />
export const IconLoader = () => <FlaticonIcon name="loading" className="animate-spin" />
export const IconSearch = () => <FlaticonIcon name="search" />
export const IconPlus = () => <FlaticonIcon name="plus" />

export default FlaticonIcon
