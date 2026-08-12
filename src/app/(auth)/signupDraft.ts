type SignupDraft = {
  profileFile: File | null;
};

const draft: SignupDraft = {
  profileFile: null,
};

export const signupDraft = {
  setProfileFile(file: File | null) {
    draft.profileFile = file;
  },
  getProfileFile() {
    return draft.profileFile;
  },
  clear() {
    draft.profileFile = null;
  },
};
