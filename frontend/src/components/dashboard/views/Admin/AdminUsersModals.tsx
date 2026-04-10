import { Input } from '@/components/ui'
import { useEffect, useId, useState  } from 'react'
import type {FormEvent} from 'react';
import { toast } from 'sonner'
import styles from './AdminUsers.module.scss'
import { generateSecurePassword } from '#/components/lib/generatePassword'
import {
  useCreateAdminUser,

  useGetSchoolStructure,
  useUpdateAdminUser,
  useResetUserPassword



} from '#/components/query/AdminQuery'
import type {AdminCreateTeacherPayload, AdminCreateStudentPayload, CredentialsPayload, AdminDirectoryUser} from '#/components/query/AdminQuery';
import { useDashboardTranslation } from '#/components/dashboard/i18n'

function copyText(value: string) {
  void navigator.clipboard.writeText(value)
  toast.success('Copied to clipboard')
}

export function CredentialsModal({
  credentials,
  title,
  subtitle,
  onClose,
}: {
  credentials: CredentialsPayload
  title: string
  subtitle?: string
  onClose: () => void
}) {
  const { t } = useDashboardTranslation()
  const id = useId()

  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modalDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.modalHead}>
          <h2 id={`${id}-title`} className={styles.modalTitle}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.modalClose}
            aria-label={t('admin.users.modals.close')}
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <div className={styles.modalBody}>
          {subtitle ? <p className={styles.modalLead}>{subtitle}</p> : null}
          <p className={styles.securityNote}>
            Passwords cannot be viewed again after you close this. Copy them now
            or use &ldquo;New temporary password&rdquo; from the user menu
            later.
          </p>
          <div className={styles.credField}>
            <span>{t('admin.users.modals.workEmail')}</span>
            <div className={styles.credRow}>
              <code>{credentials.email}</code>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => copyText(credentials.email)}
              >
                {t('admin.users.modals.copy')}
              </button>
            </div>
          </div>
          <div className={styles.credField}>
            <span>{t('admin.users.newTemporaryPassword')}</span>
            <div className={styles.credRow}>
              <code>{credentials.temporaryPassword}</code>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={() => copyText(credentials.temporaryPassword)}
              >
                {t('admin.users.modals.copy')}
              </button>
            </div>
          </div>
        </div>
        <footer className={styles.modalFooter}>
          <button type="button" className="btn btn-primary" onClick={onClose}>
            {t('admin.users.modals.done')}
          </button>
        </footer>
      </div>
    </div>
  )
}

export function AddTeacherModal({
  onClose,
  onCredentials,
}: {
  onClose: () => void
  onCredentials: (c: CredentialsPayload) => void
}) {
  const { t } = useDashboardTranslation()
  const { mutate, isPending } = useCreateAdminUser()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState(() => generateSecurePassword())
  const [specialization, setSpecialization] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !email.trim() || password.length < 8) return
    const payload: AdminCreateTeacherPayload = {
      role: 'TEACHER',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      specialization: specialization.trim() || undefined,
      phoneNumber: phoneNumber.trim() || undefined,
      ...(gender ? { gender } : {}),
    }
    mutate(payload, {
      onSuccess: (data) => {
        onCredentials({
          email: data.user.email,
          temporaryPassword: data.temporaryPassword,
        })
        onClose()
      },
    })
  }

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modalDialog}
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.modalHead}>
          <div>
            <h2 className={styles.modalTitle}>{t('admin.users.addTeacher')}</h2>
            <p className={styles.modalLead}>
              You set the login email and initial password. They can change the
              password after first sign-in.
            </p>
          </div>
          <button
            type="button"
            className={styles.modalClose}
            aria-label={t('admin.users.modals.close')}
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <form
          id="add-teacher-form"
          className={styles.modalBody}
          onSubmit={submit}
        >
          <label className={styles.field}>
            <span>{t('admin.users.modals.fullName')}</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={t('admin.users.modals.teacherNamePlaceholder')}
              fullWidth
            />
          </label>
          <label className={styles.field}>
            <span>{t('admin.users.modals.schoolEmail')}</span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t('admin.users.modals.emailPlaceholder')}
              fullWidth
            />
          </label>
          <label className={styles.field}>
            <span>{t('admin.users.modals.initialPassword')}</span>
            <div className={styles.passwordRow}>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                fullWidth
              />
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPassword(generateSecurePassword())}
              >
                {t('admin.users.modals.generate')}
              </button>
            </div>
          </label>
          <label className={styles.field}>
            <span>{t('admin.users.modals.specialization')}</span>
            <Input
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder={t('admin.users.modals.specializationPlaceholder')}
              fullWidth
            />
          </label>
          <label className={styles.field}>
            <span>{t('admin.users.modals.phone')}</span>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              fullWidth
            />
          </label>
          <label className={styles.field}>
            <span>{t('admin.users.modals.gender')}</span>
            <select
              value={gender}
              onChange={(e) =>
                setGender(e.target.value as 'Male' | 'Female' | 'Other' | '')
              }
            >
              <option value="">Prefer not to say</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </label>
        </form>
        <footer className={styles.modalFooter}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isPending}
          >
            {t('admin.users.announcementsCancel')}
          </button>
          <button
            type="submit"
            form="add-teacher-form"
            className="btn btn-primary"
            disabled={isPending}
          >
            {isPending ? t('admin.users.modals.creating') : t('admin.users.modals.createTeacher')}
          </button>
        </footer>
      </div>
    </div>
  )
}

export function AddStudentModal({
  onClose,
  onCredentials,
}: {
  onClose: () => void
  onCredentials: (c: CredentialsPayload) => void
}) {
  const { t } = useDashboardTranslation()
  const { mutate, isPending } = useCreateAdminUser()
  const { data: yearGroups, isLoading } = useGetSchoolStructure()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState(() => generateSecurePassword())
  const [enrolledYearGroupId, setEnrolledYearGroupId] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | ''>('')

  const submit = (e: FormEvent) => {
    e.preventDefault()
    const yg = Number(enrolledYearGroupId)
    if (
      !name.trim() ||
      !email.trim() ||
      password.length < 8 ||
      !Number.isFinite(yg)
    )
      return
    const payload: AdminCreateStudentPayload = {
      role: 'STUDENT',
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      enrolledYearGroupId: yg,
      phoneNumber: phoneNumber.trim() || undefined,
      ...(gender ? { gender } : {}),
    }
    mutate(payload, {
      onSuccess: (data) => {
        onCredentials({
          email: data.user.email,
          temporaryPassword: data.temporaryPassword,
        })
        onClose()
      },
    })
  }

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modalDialog}
        role="dialog"
        aria-modal="true"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.modalHead}>
          <div>
            <h2 className={styles.modalTitle}>{t('admin.users.addStudent')}</h2>
            <p className={styles.modalLead}>
              Assign a cohort now. Share the email and password securely with
              the family or student.
            </p>
          </div>
          <button
            type="button"
            className={styles.modalClose}
            aria-label={t('admin.users.modals.close')}
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <form
          id="add-student-form"
          className={styles.modalBody}
          onSubmit={submit}
        >
          <label className={styles.field}>
            <span>{t('admin.users.modals.fullName')}</span>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
          </label>
          <label className={styles.field}>
            <span>{t('admin.users.modals.loginEmail')}</span>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
          </label>
          <label className={styles.field}>
            <span>{t('admin.users.modals.initialPassword')}</span>
            <div className={styles.passwordRow}>
              <Input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                fullWidth
              />
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setPassword(generateSecurePassword())}
              >
                {t('admin.users.modals.generate')}
              </button>
            </div>
          </label>
          <label className={styles.field}>
            <span>{t('admin.users.modals.yearGroup')}</span>
            <select
              value={enrolledYearGroupId}
              onChange={(e) => setEnrolledYearGroupId(e.target.value)}
              required
              disabled={isLoading || !yearGroups?.length}
            >
              <option value="">
                {isLoading
                  ? t('admin.users.modals.loading')
                  : !yearGroups?.length
                    ? t('admin.users.modals.createYearGroupFirst')
                    : t('admin.users.modals.selectCohort')}
              </option>
              {yearGroups?.map((yg) => (
                <option key={yg.id} value={yg.id}>
                  {yg.name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.field}>
            <span>{t('admin.users.modals.phone')}</span>
            <Input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              fullWidth
            />
          </label>
          <label className={styles.field}>
            <span>{t('admin.users.modals.gender')}</span>
            <select
              value={gender}
              onChange={(e) =>
                setGender(e.target.value as 'Male' | 'Female' | 'Other' | '')
              }
            >
              <option value="">{t('admin.users.modals.preferNotToSay')}</option>
              <option value="Male">{t('admin.users.modals.male')}</option>
              <option value="Female">{t('admin.users.modals.female')}</option>
              <option value="Other">{t('admin.users.modals.other')}</option>
            </select>
          </label>
        </form>
        <footer className={styles.modalFooter}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isPending}
          >
            {t('admin.users.announcementsCancel')}
          </button>
          <button
            type="submit"
            form="add-student-form"
            className="btn btn-primary"
            disabled={isPending || !enrolledYearGroupId || !yearGroups?.length}
          >
            {isPending
              ? t('admin.users.modals.creating')
              : t('admin.users.modals.createStudent')}
          </button>
        </footer>
      </div>
    </div>
  )
}

export function DeleteUserModal({
  user,
  onClose,
  onConfirm,
}: {
  user: Pick<AdminDirectoryUser, 'id' | 'name' | 'email'>
  onClose: () => void
  onConfirm: () => void
}) {
  const id = useId()
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])

  return (
    <div className={styles.modalOverlay} role="presentation" onClick={onClose}>
      <div
        className={styles.modalDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-del`}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.modalHead}>
          <h2 id={`${id}-del`} className={styles.modalTitle}>
            Remove user?
          </h2>
          <button
            type="button"
            className={styles.modalClose}
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>
        <div className={styles.modalBody}>
          <p className={styles.modalLead}>
            <strong>{user.name}</strong> ({user.email}) will be permanently
            removed if they have no grades, attendance, or other blocking
            records.
          </p>
        </div>
        <footer className={styles.modalFooter}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className={`btn ${styles.dangerBtn}`}
            onClick={() => onConfirm()}
          >
            Delete user
          </button>
        </footer>
      </div>
    </div>
  )
}

export function UserProfileDrawer({
  user,
  onClose,
  onRequestCredentials,
  onDelete,
  onToggleAccess,
}: {
  user: AdminDirectoryUser
  onClose: () => void
  onRequestCredentials: (credentials: CredentialsPayload) => void
  onDelete: (user: AdminDirectoryUser) => void
  onToggleAccess: (user: AdminDirectoryUser) => void
}) {
  const { data: yearGroups } = useGetSchoolStructure()
  const { mutate: updateUser, isPending: isSaving } = useUpdateAdminUser()
  const { mutate: resetPassword, isPending: isResetting } =
    useResetUserPassword()
  const isTeacher = user.role === 'TEACHER'
  const isStudent = user.role === 'STUDENT'
  const [name, setName] = useState(user.name)
  const [email, setEmail] = useState(user.email)
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? '')
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>(
    user.gender ?? 'Other',
  )
  const [specialization, setSpecialization] = useState(
    user.specialization ?? '',
  )
  const [yearGroupId, setYearGroupId] = useState(
    user.enrolledYearGroupId ? String(user.enrolledYearGroupId) : '',
  )
  const id = useId()

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  useEffect(() => {
    setName(user.name)
    setEmail(user.email)
    setPhoneNumber(user.phoneNumber ?? '')
    setGender(user.gender ?? 'Other')
    setSpecialization(user.specialization ?? '')
    setYearGroupId(
      user.enrolledYearGroupId ? String(user.enrolledYearGroupId) : '',
    )
  }, [user])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    if (isTeacher) {
      updateUser(
        {
          userId: user.id,
          role: 'TEACHER',
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phoneNumber: phoneNumber.trim() || null,
          gender,
          specialization: specialization.trim() || null,
        },
        { onSuccess: onClose },
      )
      return
    }

    updateUser(
      {
        userId: user.id,
        role: 'STUDENT',
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim() || null,
        gender,
        enrolledYearGroupId: yearGroupId ? Number(yearGroupId) : null,
      },
      { onSuccess: onClose },
    )
  }

  const handleResetPassword = () => {
    if (
      !window.confirm(
        `Generate a new temporary password for ${user.name}? They will be signed out everywhere.`,
      )
    ) {
      return
    }
    resetPassword(user.id, {
      onSuccess: (data) => {
        onRequestCredentials(data)
      },
    })
  }

  return (
    <div className={styles.drawerShell} role="presentation" onClick={onClose}>
      <aside
        className={styles.drawer}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={styles.drawerHead}>
          <div className={styles.drawerIdentity}>
            <div className={styles.drawerAvatar}>
              {(user.initials || user.name.slice(0, 2)).toUpperCase()}
            </div>
            <div>
              <div className={styles.drawerEyebrow}>
                {isTeacher ? 'Teacher profile' : 'Student profile'}
              </div>
              <h2 id={`${id}-title`} className={styles.drawerTitle}>
                {user.name}
              </h2>
              <p className={styles.drawerSub}>{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            className={styles.modalClose}
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className={styles.drawerBody}>
          <div className={styles.drawerStats}>
            <div className={styles.infoChip}>
              <span>Status</span>
              <strong>{user.status}</strong>
            </div>
            <div className={styles.infoChip}>
              <span>{isTeacher ? 'Focus' : 'Year group'}</span>
              <strong>
                {isTeacher
                  ? user.specialization || 'Not set'
                  : user.enrolledYearGroup?.name || 'Not assigned'}
              </strong>
            </div>
          </div>

          <div className={styles.drawerActions}>
            <button
              type="button"
              className="btn"
              onClick={() => onToggleAccess(user)}
            >
              {user.status === 'Active' ? 'Restrict login' : 'Restore login'}
            </button>
            <button
              type="button"
              className="btn"
              onClick={handleResetPassword}
              disabled={isResetting}
            >
              {isResetting ? 'Generating…' : 'Regenerate password'}
            </button>
            <button
              type="button"
              className={`btn ${styles.dangerBtn}`}
              onClick={() => onDelete(user)}
            >
              Delete user
            </button>
          </div>

          <form className={styles.drawerForm} onSubmit={submit}>
            <Input
              label="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              fullWidth
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
            />
            <Input
              label="Phone number"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              fullWidth
            />

            <label className={styles.field}>
              <span>Gender</span>
              <select
                value={gender}
                onChange={(e) =>
                  setGender(e.target.value as 'Male' | 'Female' | 'Other')
                }
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </label>

            {isTeacher ? (
              <Input
                label="Specialization"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                fullWidth
              />
            ) : null}

            {isStudent ? (
              <label className={styles.field}>
                <span>Year group</span>
                <select
                  value={yearGroupId}
                  onChange={(e) => setYearGroupId(e.target.value)}
                >
                  <option value="">Not assigned</option>
                  {yearGroups?.map((yg) => (
                    <option key={yg.id} value={yg.id}>
                      {yg.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            <div className={styles.drawerFooter}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isSaving}
              >
                {isSaving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      </aside>
    </div>
  )
}
