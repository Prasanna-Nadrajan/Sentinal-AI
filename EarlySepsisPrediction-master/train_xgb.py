import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from xgboost import XGBClassifier
import joblib
from pathlib import Path

def main():
    base_dir = Path('/home/prasaz_nat/desk/projects/Sentinal-AI/EarlySepsisPrediction-master')
    print("Loading data...")
    df = pd.read_csv(base_dir / 'train.psv', sep='|')
    
    features = [
        "HR", "O2Sat", "Temp", "SBP", "MAP", "DBP", "Resp", "FiO2", "Glucose", 
        "Age", "Gender", "Unit1", "Unit2", "HospAdmTime", "ICULOS"
    ]
    target = "SepsisLabel"
    
    # Filter columns to only what is needed to save memory
    df = df[features + [target]].copy()
    
    # Simple split (you'd normally use patient IDs, but for MVP this is fine)
    X = df[features]
    y = df[target]
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    numeric_features = [
        "HR", "O2Sat", "Temp", "SBP", "MAP", "DBP", "Resp", "FiO2", "Glucose", 
        "Age", "HospAdmTime", "ICULOS"
    ]
    categorical_features = ["Gender", "Unit1", "Unit2"]
    
    numeric_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='median')),
        ('scaler', StandardScaler())
    ])

    categorical_transformer = Pipeline(steps=[
        ('imputer', SimpleImputer(strategy='constant', fill_value=-1)),
        ('onehot', OneHotEncoder(handle_unknown='ignore'))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', numeric_transformer, numeric_features),
            ('cat', categorical_transformer, categorical_features)
        ]
    )
    
    # Calculate scale_pos_weight
    # ratio = count_negative / count_positive
    count_neg = (y_train == 0).sum()
    count_pos = (y_train == 1).sum()
    scale_weight = count_neg / max(count_pos, 1)
    print(f"Negative samples: {count_neg}")
    print(f"Positive samples: {count_pos}")
    print(f"Calculated scale_pos_weight: {scale_weight:.2f}")

    classifier = XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        scale_pos_weight=scale_weight,
        random_state=42,
        use_label_encoder=False,
        eval_metric='logloss',
        n_jobs=-1
    )

    clf = Pipeline(steps=[
        ('preprocessor', preprocessor),
        ('classifier', classifier)
    ])
    
    print("Training XGBoost Pipeline...")
    clf.fit(X_train, y_train)
    
    print("Training complete. Evaluating on test set...")
    probs = clf.predict_proba(X_test)[:, 1]
    preds = clf.predict(X_test)
    
    from sklearn.metrics import classification_report, roc_auc_score
    print("ROC AUC:", roc_auc_score(y_test, probs))
    print(classification_report(y_test, preds))
    
    out_path = base_dir / 'sepsis_xgb_model.joblib'
    print(f"Saving model to {out_path}...")
    joblib.dump(clf, out_path)
    print("Done!")

if __name__ == "__main__":
    main()
